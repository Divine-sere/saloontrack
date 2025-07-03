import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import type { AnalyticsData, DashboardStats } from "@shared/schema";

interface AnalyticsDashboardProps {
  businessId: number;
}

export default function AnalyticsDashboard({ businessId }: AnalyticsDashboardProps) {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/business/${businessId}/analytics`],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/business/${businessId}/stats`],
  });

  const isLoading = analyticsLoading || statsLoading;

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  const formatGrowth = (value: number) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{Math.abs(value)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visit Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayVisits || 0}</div>
            <p className="text-xs text-muted-foreground">visits today</p>
            <div className="mt-2">
              {analytics?.monthlyGrowth && formatGrowth(analytics.monthlyGrowth.visits)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyRevenue || "KES 0"}</div>
            <p className="text-xs text-muted-foreground">this month</p>
            <div className="mt-2">
              {analytics?.monthlyGrowth && formatGrowth(analytics.monthlyGrowth.revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Growth</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">active customers</p>
            <div className="mt-2">
              {analytics?.monthlyGrowth && formatGrowth(analytics.monthlyGrowth.customers)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Visit Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.visitTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'visits' ? value : `KES ${Number(value).toFixed(2)}`,
                    name === 'visits' ? 'Visits' : 'Revenue'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.servicePopularity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? value : `KES ${Number(value).toFixed(2)}`,
                    name === 'count' ? 'Bookings' : 'Revenue'
                  ]}
                />
                <Bar dataKey="count" fill="#3B82F6" />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topCustomers?.slice(0, 8).map((item, index) => (
                <div key={item.customer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {item.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.customer.name}</p>
                      <p className="text-xs text-gray-500">{item.visits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {(item.spent / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      Avg: KES {(item.spent / item.visits / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-8">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Retention:</span>
                    <span className="font-semibold">{stats?.customerRetentionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Visit Value:</span>
                    <span className="font-semibold">{stats?.averageVisitValue || "KES 0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Popular Service:</span>
                    <span className="font-semibold">{stats?.topService || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold">{stats?.totalRevenue || "KES 0"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <div className="space-y-2 text-sm">
                  {stats && stats.customerRetentionRate < 50 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">💡 Consider sending reminder SMS to inactive customers</p>
                    </div>
                  )}
                  {analytics && analytics.topCustomers && analytics.topCustomers.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">🎯 Focus on VIP customers for premium services</p>
                    </div>
                  )}
                  {stats && parseFloat(stats.averageVisitValue.replace(/[^\d.]/g, '')) < 1000 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">📈 Consider upselling additional services</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}