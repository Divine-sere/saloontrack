import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Users, Star, Gift, TrendingUp, BarChart3 } from "lucide-react";
import StatsCards from "@/components/stats-cards";
import CustomerCheckIn from "@/components/customer-check-in";
import RecentActivity from "@/components/recent-activity";
import CustomerTable from "@/components/customer-table";
import LoyaltySettings from "@/components/loyalty-settings";
import AnalyticsDashboard from "@/components/analytics-dashboard";

export default function Dashboard() {
  // For demo purposes, using business ID 1
  const businessId = 1;
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: [`/api/business/${businessId}`],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/business/${businessId}/stats`],
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">SalonTrack</h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-1 pb-4 text-sm font-medium ${
                    activeTab === "dashboard" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("customers")}
                  className={`px-1 pb-4 text-sm font-medium ${
                    activeTab === "customers" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Customers
                </button>
                <button 
                  onClick={() => setActiveTab("analytics")}
                  className={`px-1 pb-4 text-sm font-medium ${
                    activeTab === "analytics" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Analytics
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`px-1 pb-4 text-sm font-medium ${
                    activeTab === "settings" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {business?.name || "Loading..."}
              </span>
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Overview */}
            <StatsCards businessId={businessId} stats={stats} isLoading={statsLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Customer Check-In */}
              <div className="lg:col-span-2">
                <CustomerCheckIn businessId={businessId} />
              </div>

              {/* Recent Activity */}
              <div>
                <RecentActivity businessId={businessId} />
              </div>
            </div>
          </>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="mt-8">
            <CustomerTable businessId={businessId} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="mt-8">
            <AnalyticsDashboard businessId={businessId} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="mt-8">
            <LoyaltySettings businessId={businessId} business={business} />
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === "dashboard" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === "customers" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Customers</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === "analytics" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === "settings" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <Gift className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
