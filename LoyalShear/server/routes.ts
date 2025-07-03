import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertBusinessSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Business routes
  app.get("/api/business/:id", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post("/api/business", async (req, res) => {
    try {
      const business = insertBusinessSchema.parse(req.body);
      const newBusiness = await storage.createBusiness(business);
      res.status(201).json(newBusiness);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(400).json({ message: "Invalid business data" });
    }
  });

  app.put("/api/business/:id", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const updates = req.body;
      const updatedBusiness = await storage.updateBusiness(businessId, updates);
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Customer routes
  app.get("/api/business/:businessId/customers", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const customers = await storage.getCustomers(businessId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/business/:businessId/customer/phone/:phone", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const phone = req.params.phone;
      const customer = await storage.getCustomerByPhone(businessId, phone);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/business/:businessId/customers", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        businessId,
      });
      const newCustomer = await storage.createCustomer(customerData);
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  // Visit routes
  app.post("/api/business/:businessId/customers/:customerId/checkin", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const customerId = parseInt(req.params.customerId);
      
      const visit = await storage.createVisit({
        customerId,
        businessId,
        rewardEarned: false,
      });
      
      // Get updated customer data
      const updatedCustomer = await storage.getCustomer(customerId);
      
      res.json({ visit, customer: updatedCustomer });
    } catch (error) {
      console.error("Error checking in customer:", error);
      res.status(500).json({ message: "Failed to check in customer" });
    }
  });

  app.get("/api/business/:businessId/visits/recent", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentVisits = await storage.getRecentVisits(businessId, limit);
      res.json(recentVisits);
    } catch (error) {
      console.error("Error fetching recent visits:", error);
      res.status(500).json({ message: "Failed to fetch recent visits" });
    }
  });

  // Reward routes
  app.get("/api/customers/:customerId/rewards", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const rewards = await storage.getAvailableRewards(customerId);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards/:rewardId/redeem", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.rewardId);
      const redeemedReward = await storage.redeemReward(rewardId);
      res.json(redeemedReward);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Analytics routes
  app.get("/api/business/:businessId/stats", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const stats = await storage.getDashboardStats(businessId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Individual customer routes
  app.get("/api/customers/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.put("/api/customers/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const updates = req.body;
      const updatedCustomer = await storage.updateCustomer(customerId, updates);
      res.json(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.get("/api/customers/:customerId/visits", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      // This would need to be implemented in storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching customer visits:", error);
      res.status(500).json({ message: "Failed to fetch customer visits" });
    }
  });

  // Analytics routes
  app.get("/api/business/:businessId/analytics", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const analytics = await storage.getAnalyticsData(businessId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // SMS routes
  app.post("/api/business/:businessId/sms", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const { customerId, phone, message, type } = req.body;
      
      const sms = await storage.createSmsNotification({
        customerId: customerId || null,
        businessId,
        phone,
        message,
        type,
        status: "sent", // In a real app, you'd integrate with SMS service
      });
      
      // In a real implementation, you'd send the SMS here via Twilio, etc.
      await storage.updateSmsStatus(sms.id, "sent", new Date());
      
      res.json(sms);
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  app.get("/api/business/:businessId/sms", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getSmsNotifications(businessId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching SMS notifications:", error);
      res.status(500).json({ message: "Failed to fetch SMS notifications" });
    }
  });

  // QR Code route
  app.get("/api/business/:businessId/qr", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Generate QR code data - this would be the URL customers scan
      const qrData = `${req.protocol}://${req.get('host')}/checkin/${businessId}`;
      res.json({ qrData, businessName: business.name });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
