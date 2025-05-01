
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndianRupee, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import BudgetSetupForm from '@/components/budget/BudgetSetupForm';

const Profile = () => {
  const { user: authUser, updateUserProfile } = useAuth();
  const { income, expenses, loans, savingGoals, isLoading } = useAppContext();
  
  const [username, setUsername] = useState(authUser?.user_metadata?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(authUser?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [budgetPromptSchedule, setBudgetPromptSchedule] = useState(localStorage.getItem('budgetSetupSchedule') || 'never');
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!authUser) return;
    
    setIsUpdating(true);
    try {
      await updateUserProfile({
        username,
        avatar_url: avatarUrl
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser?.id || !event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${authUser.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    setUploading(true);
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (data) {
        setAvatarUrl(data.publicUrl);
      }
      
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };
  
  const handleScheduleChange = (value: string) => {
    setBudgetPromptSchedule(value);
    localStorage.setItem('budgetSetupSchedule', value);
    toast.success('Budget setup schedule updated');
  };
  
  const handleBudgetSetupComplete = () => {
    setShowBudgetSetup(false);
    toast.success('Budget preferences saved');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total loan payments
  const totalLoanPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  
  // Calculate total savings
  const totalSavings = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span>Finance Summary</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={username || authUser?.email || 'User'} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {username ? username[0].toUpperCase() : authUser?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="block">Profile Picture</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a profile picture (max 5MB)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={authUser?.email || ''}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Set a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
                {isUpdating ? 'Updating Profile...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Monthly Income</span>
                  </div>
                  <span className="text-green-600 font-bold">{formatCurrency(income?.amount || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium">Total Expenses</span>
                  </div>
                  <span className="text-red-600 font-bold">{formatCurrency(totalExpenses)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Total Loan Payments</span>
                  </div>
                  <span className="text-blue-600 font-bold">{formatCurrency(totalLoanPayments)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="font-medium">Total Savings</span>
                  </div>
                  <span className="text-purple-600 font-bold">{formatCurrency(totalSavings)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Remaining Balance</span>
                  </div>
                  <span className="text-primary font-bold">
                    {formatCurrency((income?.amount || 0) - totalExpenses - totalLoanPayments)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="budget-reminder">Budget Setup Reminder</Label>
                <Select
                  value={budgetPromptSchedule}
                  onValueChange={handleScheduleChange}
                >
                  <SelectTrigger id="budget-reminder" className="w-full">
                    <SelectValue placeholder="Select when to remind you" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose how often you want to be reminded to review your budget
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Budget Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Define how your income should be allocated across different spending categories
                </p>
                
                <Sheet open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
                  <SheetTrigger asChild>
                    <Button className="w-full">Set Budget Allocation</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
                    <SheetHeader className="mb-5">
                      <SheetTitle>Budget Setup</SheetTitle>
                      <SheetDescription>
                        Allocate your income across different spending categories
                      </SheetDescription>
                    </SheetHeader>
                    <BudgetSetupForm onComplete={handleBudgetSetupComplete} />
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
