
import React, { useState, useEffect } from 'react';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import SavingsGoalCard from '@/components/dashboard/SavingsGoalsCard';
import { useAppContext } from '@/contexts/AppContext';
import IncomeSetupForm from '@/components/auth/IncomeSetupForm';
import { Skeleton } from "@/components/ui/skeleton";
import BudgetSetupForm from '@/components/budget/BudgetSetupForm';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const Home = () => {
  const { income, isLoading, user, loans } = useAppContext();
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  
  // Fetch budget data
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBudgetData(data);
        } else {
          // Show budget setup if no budget data exists
          setShowBudgetSetup(true);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
        toast.error('Failed to fetch budget data');
      } finally {
        setIsBudgetLoading(false);
      }
    };
    
    if (income && user?.id) {
      fetchBudgetData();
    }
  }, [user?.id, income]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1">
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }
  
  // If user hasn't set up their income, show the setup form
  if (!income) {
    return <IncomeSetupForm />;
  }
  
  return (
    <>
      <Dialog open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
        <DialogContent className="sm:max-w-[600px]" showClose={false}>
          <BudgetSetupForm onComplete={() => setShowBudgetSetup(false)} />
        </DialogContent>
      </Dialog>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1">
            <BalanceCard />
          </div>
          <div className="col-span-1">
            <CategoryBreakdown />
          </div>
          <div className="col-span-1">
            <SavingsGoalCard />
          </div>
        </div>
        
        {loans.length > 0 && (
          <div className="grid gap-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">Upcoming Loan Payments</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  {loans.map((loan) => {
                    const progressPercentage = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
                    
                    return (
                      <div key={loan.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{loan.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Due on {format(new Date(loan.nextPaymentDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(loan.monthlyPayment)}</div>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(loan.remainingAmount)} remaining
                            </p>
                          </div>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Budget Status */}
        {!isBudgetLoading && budgetData.length > 0 && (
          <div className="grid gap-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">Budget Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  {budgetData.map((budget) => {
                    // Calculate expenses in this category
                    return (
                      <div key={budget.category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-category-${budget.category}`}></div>
                            <span className="font-medium capitalize">{budget.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              <span className="font-medium">{formatCurrency(budget.amount)}</span>
                            </div>
                          </div>
                        </div>
                        <Progress value={(0 / budget.amount) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-1">
          <RecentExpenses />
        </div>
      </div>
    </>
  );
};

export default Home;
