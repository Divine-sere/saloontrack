import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import QRCodeDisplay from "./qr-code-display";
import type { Customer } from "@shared/schema";

interface CustomerCheckInProps {
  businessId: number;
}

export default function CustomerCheckIn({ businessId }: CustomerCheckInProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const lookupMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("GET", `/api/business/${businessId}/customer/phone/${encodeURIComponent(phone)}`);
      return response.json();
    },
    onSuccess: (customer) => {
      setFoundCustomer(customer);
    },
    onError: (error) => {
      if (error.message.includes("404")) {
        setFoundCustomer(null);
        toast({
          title: "Customer not found",
          description: "Would you like to add this customer?",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to lookup customer",
          variant: "destructive",
        });
      }
    },
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
        variant: "default",
      });
      
      // Reset form
      setPhoneNumber("");
      setFoundCustomer(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/visits/recent`] });
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}/customers`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check in customer",
        variant: "destructive",
      });
    },
  });

  const handleLookup = () => {
    if (!phoneNumber.trim()) return;
    lookupMutation.mutate(phoneNumber.trim());
  };

  const handleCheckIn = () => {
    if (!foundCustomer) return;
    checkInMutation.mutate(foundCustomer.id);
  };

  const getProgressDots = (visits: number, required: number) => {
    const filled = Math.min(visits, required);
    const empty = required - filled;
    
    return (
      <div className="flex space-x-1">
        {Array.from({ length: filled }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-green-600"></div>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <div key={i + filled} className="w-3 h-3 rounded-full bg-gray-200"></div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Customer Check-In</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number Lookup */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Phone Number Lookup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                <div className="flex space-x-2">
                  <Input
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleLookup}
                    disabled={lookupMutation.isPending || !phoneNumber.trim()}
                    size="icon"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Customer Found State */}
              {foundCustomer && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {foundCustomer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{foundCustomer.name}</p>
                      <p className="text-sm text-gray-600">
                        Last visit: {foundCustomer.lastVisit 
                          ? new Date(foundCustomer.lastVisit).toLocaleDateString()
                          : "Never"
                        }
                      </p>
                      <div className="flex items-center mt-1">
                        {getProgressDots(foundCustomer.visits, 10)}
                        <span className="ml-2 text-sm text-gray-600">
                          {foundCustomer.visits}/10 visits
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                  >
                    {checkInMutation.isPending ? "Checking in..." : "Check In Customer"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          <QRCodeDisplay businessId={businessId} />
        </div>
      </CardContent>
    </Card>
  );
}
