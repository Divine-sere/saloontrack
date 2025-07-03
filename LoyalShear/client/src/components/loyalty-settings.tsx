import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Business } from "@shared/schema";

interface LoyaltySettingsProps {
  businessId: number;
  business?: Business;
}

export default function LoyaltySettings({ businessId, business }: LoyaltySettingsProps) {
  const [settings, setSettings] = useState({
    visitsRequired: 10,
    rewardDescription: "Free service",
    smsEnabled: true,
    rewardExpiryDays: 30,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update settings when business data loads
  useEffect(() => {
    if (business) {
      setSettings({
        visitsRequired: business.visitsRequired,
        rewardDescription: business.rewardDescription,
        smsEnabled: business.smsEnabled,
        rewardExpiryDays: business.rewardExpiryDays,
      });
    }
  }, [business]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<typeof settings>) => {
      const response = await apiRequest("PUT", `/api/business/${businessId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your loyalty program settings have been saved successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/business/${businessId}`] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Loyalty Program Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="visitsRequired" className="text-sm font-medium text-gray-700 mb-2 block">
              Visits Required for Reward
            </Label>
            <Input
              id="visitsRequired"
              type="number"
              min="1"
              max="100"
              value={settings.visitsRequired}
              onChange={(e) => handleInputChange('visitsRequired', parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="rewardDescription" className="text-sm font-medium text-gray-700 mb-2 block">
              Reward Description
            </Label>
            <Input
              id="rewardDescription"
              type="text"
              value={settings.rewardDescription}
              onChange={(e) => handleInputChange('rewardDescription', e.target.value)}
              placeholder="e.g., Free haircut, 20% discount"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="smsEnabled" className="text-sm font-medium text-gray-700 mb-2 block">
              SMS Notifications
            </Label>
            <Select
              value={settings.smsEnabled ? "enabled" : "disabled"}
              onValueChange={(value) => handleInputChange('smsEnabled', value === "enabled")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="rewardExpiry" className="text-sm font-medium text-gray-700 mb-2 block">
              Reward Expiry (Days)
            </Label>
            <Input
              id="rewardExpiry"
              type="number"
              min="1"
              max="365"
              value={settings.rewardExpiryDays}
              onChange={(e) => handleInputChange('rewardExpiryDays', parseInt(e.target.value) || 30)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
