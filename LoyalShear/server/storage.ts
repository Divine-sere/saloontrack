import {
  businesses,
  customers,
  visits,
  rewards,
  smsNotifications,
  type Business,
  type InsertBusiness,
  type Customer,
  type InsertCustomer,
  type Visit,
  type InsertVisit,
  type Reward,
  type InsertReward,
  type SmsNotification,
  type InsertSmsNotification,
  type CustomerWithProgress,
  type VisitWithCustomer,
  type DashboardStats,
  type AnalyticsData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business>;

  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(businessId: number, phone: string): Promise<Customer | undefined>;
  getCustomers(businessId: number): Promise<CustomerWithProgress[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer>;

  // Visit operations
  createVisit(visit: InsertVisit): Promise<Visit>;
  getRecentVisits(businessId: number, limit?: number): Promise<VisitWithCustomer[]>;

  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getAvailableRewards(customerId: number): Promise<Reward[]>;
  redeemReward(rewardId: number): Promise<Reward>;

  // SMS operations
  createSmsNotification(sms: InsertSmsNotification): Promise<SmsNotification>;
  getSmsNotifications(businessId: number, limit?: number): Promise<SmsNotification[]>;
  updateSmsStatus(id: number, status: string, sentAt?: Date): Promise<SmsNotification>;

  // Analytics
  getDashboardStats(businessId: number): Promise<DashboardStats>;
  getAnalyticsData(businessId: number): Promise<AnalyticsData>;
}

export class DatabaseStorage implements IStorage {
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set(business)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(businessId: number, phone: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.businessId, businessId), eq(customers.phone, phone)));
    return customer;
  }

  async getCustomers(businessId: number): Promise<CustomerWithProgress[]> {
    const business = await this.getBusiness(businessId);
    if (!business) throw new Error("Business not found");

    const customersData = await db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.lastVisit));

    return customersData.map(customer => ({
      ...customer,
      progressPercentage: Math.min((customer.visits / business.visitsRequired) * 100, 100),
      hasAvailableReward: customer.visits >= business.visitsRequired && 
                         customer.rewardsEarned > customer.rewardsRedeemed,
      averageSpent: customer.totalSpent > 0 ? customer.totalSpent / Math.max(customer.visits, 1) : 0,
      lastServiceType: undefined, // Will be populated from last visit if needed
    }));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [newVisit] = await db.insert(visits).values(visit).returning();
    
    // Update customer visit count and last visit
    const customer = await this.getCustomer(visit.customerId);
    if (!customer) throw new Error("Customer not found");

    const business = await this.getBusiness(visit.businessId);
    if (!business) throw new Error("Business not found");

    const newVisitCount = customer.visits + 1;
    let rewardEarned = false;

    // Check if customer earned a reward
    if (newVisitCount % business.visitsRequired === 0) {
      rewardEarned = true;
      // Create reward
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + business.rewardExpiryDays);
      
      await this.createReward({
        customerId: visit.customerId,
        businessId: visit.businessId,
        earned: true,
        redeemed: false,
        expiresAt,
      });

      await this.updateCustomer(visit.customerId, {
        visits: newVisitCount,
        rewardsEarned: customer.rewardsEarned + 1,
        lastVisit: new Date(),
      });
    } else {
      await this.updateCustomer(visit.customerId, {
        visits: newVisitCount,
        lastVisit: new Date(),
      });
    }

    // Update visit with reward info
    if (rewardEarned) {
      await db.update(visits).set({ rewardEarned: true }).where(eq(visits.id, newVisit.id));
    }

    return newVisit;
  }

  async getRecentVisits(businessId: number, limit = 10): Promise<VisitWithCustomer[]> {
    const recentVisits = await db
      .select({
        visit: visits,
        customer: customers,
      })
      .from(visits)
      .innerJoin(customers, eq(visits.customerId, customers.id))
      .where(eq(visits.businessId, businessId))
      .orderBy(desc(visits.visitDate))
      .limit(limit);

    return recentVisits.map(({ visit, customer }) => ({
      ...visit,
      customer,
    }));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async getAvailableRewards(customerId: number): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(
        and(
          eq(rewards.customerId, customerId),
          eq(rewards.earned, true),
          eq(rewards.redeemed, false)
        )
      );
  }

  async redeemReward(rewardId: number): Promise<Reward> {
    const [redeemedReward] = await db
      .update(rewards)
      .set({ redeemed: true, redeemedAt: new Date() })
      .where(eq(rewards.id, rewardId))
      .returning();

    // Update customer redeemed count
    const customer = await this.getCustomer(redeemedReward.customerId);
    if (customer) {
      await this.updateCustomer(customer.id, {
        rewardsRedeemed: customer.rewardsRedeemed + 1,
      });
    }

    return redeemedReward;
  }

  async getDashboardStats(businessId: number): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get today's visits
    const [todayVisitsResult] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(eq(visits.businessId, businessId), gte(visits.visitDate, today)));

    // Get active customers
    const [activeCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.businessId, businessId));

    // Get monthly rewards earned
    const [rewardsEarnedResult] = await db
      .select({ count: count() })
      .from(rewards)
      .where(and(eq(rewards.businessId, businessId), gte(rewards.earnedAt, thisMonth)));

    // Get revenue data
    const [monthlyRevenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)` })
      .from(visits)
      .where(and(eq(visits.businessId, businessId), gte(visits.visitDate, thisMonth)));

    const [totalRevenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)` })
      .from(visits)
      .where(eq(visits.businessId, businessId));

    // Get average visit value
    const [avgVisitResult] = await db
      .select({ avg: sql<number>`COALESCE(AVG(${visits.amountSpent}), 0)` })
      .from(visits)
      .where(and(eq(visits.businessId, businessId), sql`${visits.amountSpent} > 0`));

    // Get top service
    const topServiceResult = await db
      .select({ 
        service: visits.serviceType, 
        count: count() 
      })
      .from(visits)
      .where(and(eq(visits.businessId, businessId), sql`${visits.serviceType} IS NOT NULL`))
      .groupBy(visits.serviceType)
      .orderBy(desc(count()))
      .limit(1);

    // Calculate retention rate (customers who visited in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(and(
        eq(customers.businessId, businessId),
        gte(customers.lastVisit, thirtyDaysAgo)
      ));

    const retentionRate = activeCustomersResult.count > 0 
      ? (recentCustomersResult.count / activeCustomersResult.count) * 100 
      : 0;

    return {
      todayVisits: todayVisitsResult.count,
      activeCustomers: activeCustomersResult.count,
      rewardsEarned: rewardsEarnedResult.count,
      monthlyRevenue: `KES ${(monthlyRevenueResult.total / 100).toFixed(2)}`,
      totalRevenue: `KES ${(totalRevenueResult.total / 100).toFixed(2)}`,
      averageVisitValue: `KES ${(avgVisitResult.avg / 100).toFixed(2)}`,
      topService: topServiceResult[0]?.service || "N/A",
      customerRetentionRate: Math.round(retentionRate),
    };
  }

  // SMS Notification methods
  async createSmsNotification(sms: InsertSmsNotification): Promise<SmsNotification> {
    const [newSms] = await db.insert(smsNotifications).values(sms).returning();
    return newSms;
  }

  async getSmsNotifications(businessId: number, limit = 50): Promise<SmsNotification[]> {
    return await db
      .select()
      .from(smsNotifications)
      .where(eq(smsNotifications.businessId, businessId))
      .orderBy(desc(smsNotifications.createdAt))
      .limit(limit);
  }

  async updateSmsStatus(id: number, status: string, sentAt?: Date): Promise<SmsNotification> {
    const updateData: any = { status };
    if (sentAt) updateData.sentAt = sentAt;

    const [updatedSms] = await db
      .update(smsNotifications)
      .set(updateData)
      .where(eq(smsNotifications.id, id))
      .returning();
    return updatedSms;
  }

  // Analytics method
  async getAnalyticsData(businessId: number): Promise<AnalyticsData> {
    // Get visit trends for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visitTrends = await db
      .select({
        date: sql<string>`DATE(${visits.visitDate})`,
        visits: count(),
        revenue: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)`
      })
      .from(visits)
      .where(and(
        eq(visits.businessId, businessId),
        gte(visits.visitDate, thirtyDaysAgo)
      ))
      .groupBy(sql`DATE(${visits.visitDate})`)
      .orderBy(sql`DATE(${visits.visitDate})`);

    // Get top customers
    const topCustomersData = await db
      .select({
        customer: customers,
        visits: customers.visits,
        spent: customers.totalSpent
      })
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.totalSpent))
      .limit(10);

    const topCustomers = topCustomersData.map(({ customer, visits, spent }) => ({
      customer,
      visits,
      spent
    }));

    // Get service popularity
    const servicePopularity = await db
      .select({
        service: visits.serviceType,
        count: count(),
        revenue: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)`
      })
      .from(visits)
      .where(and(
        eq(visits.businessId, businessId),
        sql`${visits.serviceType} IS NOT NULL`
      ))
      .groupBy(visits.serviceType)
      .orderBy(desc(count()));

    // Get monthly growth (current month vs previous month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentMonthStats] = await db
      .select({
        visits: count(),
        revenue: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)`,
        customers: sql<number>`COUNT(DISTINCT ${visits.customerId})`
      })
      .from(visits)
      .where(and(
        eq(visits.businessId, businessId),
        gte(visits.visitDate, currentMonth)
      ));

    const [previousMonthStats] = await db
      .select({
        visits: count(),
        revenue: sql<number>`COALESCE(SUM(${visits.amountSpent}), 0)`,
        customers: sql<number>`COUNT(DISTINCT ${visits.customerId})`
      })
      .from(visits)
      .where(and(
        eq(visits.businessId, businessId),
        gte(visits.visitDate, previousMonth),
        sql`${visits.visitDate} < ${currentMonth}`
      ));

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      visitTrends: visitTrends.map(trend => ({
        date: trend.date,
        visits: trend.visits,
        revenue: trend.revenue / 100 // Convert from cents
      })),
      topCustomers,
      servicePopularity: servicePopularity.map(service => ({
        service: service.service || "Unknown",
        count: service.count,
        revenue: service.revenue / 100 // Convert from cents
      })),
      monthlyGrowth: {
        visits: calculateGrowth(currentMonthStats.visits, previousMonthStats.visits),
        revenue: calculateGrowth(currentMonthStats.revenue, previousMonthStats.revenue),
        customers: calculateGrowth(Number(currentMonthStats.customers), Number(previousMonthStats.customers))
      }
    };
  }
}

export const storage = new DatabaseStorage();
