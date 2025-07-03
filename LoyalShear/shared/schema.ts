import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  visitsRequired: integer("visits_required").default(10).notNull(),
  rewardDescription: text("reward_description").default("Free service").notNull(),
  smsEnabled: boolean("sms_enabled").default(true).notNull(),
  rewardExpiryDays: integer("reward_expiry_days").default(30).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  preferredServices: text("preferred_services").array(),
  notes: text("notes"),
  visits: integer("visits").default(0).notNull(),
  rewardsEarned: integer("rewards_earned").default(0).notNull(),
  rewardsRedeemed: integer("rewards_redeemed").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(), // in KES cents
  lastVisit: timestamp("last_visit"),
  smsOptIn: boolean("sms_opt_in").default(true).notNull(),
  emailOptIn: boolean("email_opt_in").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  visitDate: timestamp("visit_date").defaultNow(),
  rewardEarned: boolean("reward_earned").default(false),
  serviceType: text("service_type"), // haircut, styling, manicure, etc.
  amountSpent: integer("amount_spent").default(0), // in KES cents
  notes: text("notes"),
  rating: integer("rating"), // 1-5 star rating
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  earned: boolean("earned").default(true),
  redeemed: boolean("redeemed").default(false),
  earnedAt: timestamp("earned_at").defaultNow(),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
});

export const smsNotifications = pgTable("sms_notifications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  businessId: integer("business_id").references(() => businesses.id).notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'welcome', 'reward_earned', 'reminder', 'promotion'
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const businessesRelations = relations(businesses, ({ many }) => ({
  customers: many(customers),
  visits: many(visits),
  rewards: many(rewards),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
  visits: many(visits),
  rewards: many(rewards),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  customer: one(customers, {
    fields: [visits.customerId],
    references: [customers.id],
  }),
  business: one(businesses, {
    fields: [visits.businessId],
    references: [businesses.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  customer: one(customers, {
    fields: [rewards.customerId],
    references: [customers.id],
  }),
  business: one(businesses, {
    fields: [rewards.businessId],
    references: [businesses.id],
  }),
}));

export const smsNotificationsRelations = relations(smsNotifications, ({ one }) => ({
  customer: one(customers, {
    fields: [smsNotifications.customerId],
    references: [customers.id],
  }),
  business: one(businesses, {
    fields: [smsNotifications.businessId],
    references: [businesses.id],
  }),
}));

// Insert schemas
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  visits: true,
  rewardsEarned: true,
  rewardsRedeemed: true,
  totalSpent: true,
  lastVisit: true,
  createdAt: true,
});

export const insertSmsNotificationSchema = createInsertSchema(smsNotifications).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  visitDate: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  earnedAt: true,
  redeemedAt: true,
});

// Types
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;
export type InsertSmsNotification = z.infer<typeof insertSmsNotificationSchema>;

// Extended types for queries
export type CustomerWithProgress = Customer & {
  progressPercentage: number;
  hasAvailableReward: boolean;
  averageSpent: number;
  lastServiceType?: string;
};

export type VisitWithCustomer = Visit & {
  customer: Customer;
};

export type DashboardStats = {
  todayVisits: number;
  activeCustomers: number;
  rewardsEarned: number;
  monthlyRevenue: string;
  totalRevenue: string;
  averageVisitValue: string;
  topService: string;
  customerRetentionRate: number;
};

export type AnalyticsData = {
  visitTrends: Array<{ date: string; visits: number; revenue: number }>;
  topCustomers: Array<{ customer: Customer; visits: number; spent: number }>;
  servicePopularity: Array<{ service: string; count: number; revenue: number }>;
  monthlyGrowth: { visits: number; revenue: number; customers: number };
};
