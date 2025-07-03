import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { VisitWithCustomer } from "@shared/schema";

interface RecentActivityProps {
  businessId: number;
}

export default function RecentActivity({ businessId }: RecentActivityProps) {
  const { data: recentVisits, isLoading } = useQuery<VisitWithCustomer[]>({
    queryKey: [`/api/business/${businessId}/visits/recent`],
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const visitDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : recentVisits && recentVisits.length > 0 ? (
            recentVisits.map((visit) => (
              <div key={visit.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {visit.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{visit.customer.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(visit.visitDate || new Date())}
                  </p>
                </div>
                <div className="text-xs">
                  {visit.rewardEarned ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Reward earned!
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">
                      +1 visit
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No recent activity</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
