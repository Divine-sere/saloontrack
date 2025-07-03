import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Eye, CheckCircle, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CustomerProfile from "./customer-profile";
import type { CustomerWithProgress } from "@shared/schema";

interface CustomerTableProps {
  businessId: number;
}

export default function CustomerTable({ businessId }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers, isLoading } = useQuery<CustomerWithProgress[]>({
    queryKey: [`/api/business/${businessId}/customers`],
  });

  const checkInMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await apiRequest("POST", `/api/business/${businessId}/customers/${customerId}/checkin`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in successful!",
        description: data.visit.rewardEarned ? "Customer earned a reward!" : "Customer checked in successfully",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/customers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/visits/recent`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  ) || [];

  const getProgressDots = (visits: number, required: number = 10) => {
    const filled = Math.min(visits % required || required, required);
    const empty = required - filled;
    
    return (
      <div className="flex items-center">
        <div className="flex space-x-1">
          {Array.from({ length: filled }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-green-600"></div>
          ))}
          {Array.from({ length: empty }).map((_, i) => (
            <div key={i + filled} className="w-2 h-2 rounded-full bg-gray-200"></div>
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">{visits % required || (visits > 0 ? required : 0)}/{required}</span>
      </div>
    );
  };

  const formatLastVisit = (lastVisit: string | null) => {
    if (!lastVisit) return "Never";
    
    const now = new Date();
    const visitDate = new Date(lastVisit);
    const diffInDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Customer Management</CardTitle>
        <div className="flex space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.hasAvailableReward ? "VIP Customer" : 
                             customer.visits > 5 ? "Regular Customer" : "New Customer"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.visits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.hasAvailableReward ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Reward Available
                        </Badge>
                      ) : (
                        getProgressDots(customer.visits)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastVisit(customer.lastVisit?.toString() || null)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {customer.hasAvailableReward ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Redeem
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => checkInMutation.mutate(customer.id)}
                          disabled={checkInMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No customers found matching your search" : "No customers yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{Math.min(filteredCustomers.length, 10)}</span> of{" "}
                <span className="font-medium">{filteredCustomers.length}</span> customers
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Customer Profile Modal */}
      {selectedCustomerId && (
        <CustomerProfile
          customerId={selectedCustomerId}
          businessId={businessId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </Card>
  );
}
