import { Users, Star, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  businessId: number;
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Visits",
      value: stats?.todayVisits?.toString() || "0",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers?.toString() || "0",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Rewards Earned",
      value: stats?.rewardsEarned?.toString() || "0",
      icon: Gift,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyRevenue || "KES 0",
      icon: TrendingUp,
      color: "text-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`${card.color} text-2xl h-8 w-8`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
