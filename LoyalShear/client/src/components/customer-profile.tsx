import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Phone, Mail, Calendar, Star, Gift, MessageSquare, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, VisitWithCustomer } from "@shared/schema";

interface CustomerProfileProps {
  customerId: number;
  businessId: number;
  onClose: () => void;
}

export default function CustomerProfile({ customerId, businessId, onClose }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${customerId}`],
  });

  const { data: customerVisits } = useQuery<VisitWithCustomer[]>({
    queryKey: [`/api/customers/${customerId}/visits`],
  });

  const { data: rewards } = useQuery({
    queryKey: [`/api/customers/${customerId}/rewards`],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Customer>) => {
      const response = await apiRequest("PUT", `/api/customers/${customerId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer updated",
        description: "Customer profile has been updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer profile",
        variant: "destructive",
      });
    },
  });

  const sendSmsMutation = useMutation({
    mutationFn: async (data: { message: string; type: string }) => {
      const response = await apiRequest("POST", `/api/business/${businessId}/sms`, {
        customerId,
        phone: customer?.phone,
        message: data.message,
        type: data.type,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS sent",
        description: "Message sent successfully to customer",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send SMS",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditForm(customer || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handleSendSms = (message: string, type: string) => {
    sendSmsMutation.mutate({ message, type });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <Badge className={customer.visits >= 10 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                  {customer.visits >= 10 ? "VIP Customer" : customer.visits > 5 ? "Regular" : "New Customer"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Member since {new Date(customer.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <Input
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <Select
                        value={editForm.gender || ""}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <Textarea
                        value={editForm.notes || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special notes about this customer..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.dateOfBirth && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <span>{new Date(customer.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {customer.gender && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="capitalize">{customer.gender}</span>
                      </div>
                    )}
                    {customer.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{customer.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visit History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerVisits && customerVisits.length > 0 ? (
                    customerVisits.slice(0, 5).map((visit) => (
                      <div key={visit.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{visit.serviceType || "Service"}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(visit.visitDate || "").toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {visit.amountSpent > 0 && (
                            <p className="font-medium">KES {(visit.amountSpent / 100).toFixed(2)}</p>
                          )}
                          {visit.rewardEarned && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              <Gift className="h-3 w-3 mr-1" />
                              Reward Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No visits recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Visits:</span>
                    <span className="font-semibold">{customer.visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rewards Earned:</span>
                    <span className="font-semibold">{customer.rewardsEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rewards Used:</span>
                    <span className="font-semibold">{customer.rewardsRedeemed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold">KES {(customer.totalSpent / 100).toFixed(2)}</span>
                  </div>
                  {customer.visits > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg per Visit:</span>
                      <span className="font-semibold">
                        KES {(customer.totalSpent / customer.visits / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span className="font-semibold">
                      {customer.lastVisit 
                        ? new Date(customer.lastVisit).toLocaleDateString()
                        : "Never"
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Rewards */}
            {rewards && rewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Available Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rewards.map((reward: any) => (
                      <div key={reward.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="font-medium text-yellow-800">Free Service Reward</p>
                        <p className="text-sm text-yellow-600">
                          Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => handleSendSms("Thank you for your loyalty! Visit us soon for your next appointment.", "promotion")}
                    disabled={sendSmsMutation.isPending}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Thank You SMS
                  </Button>
                  
                  {customer.rewardsEarned > customer.rewardsRedeemed && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSendSms("You have a reward waiting! Come redeem your free service today.", "reward_reminder")}
                      disabled={sendSmsMutation.isPending}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Remind About Reward
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSendSms("It's been a while! Book your next appointment and get 10% off.", "reminder")}
                    disabled={sendSmsMutation.isPending}
                  >
                    Send Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}