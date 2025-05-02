
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import SavingsGoalsCard from '@/components/dashboard/SavingsGoalsCard';
import ActiveLoans from '@/components/dashboard/ActiveLoans';
import BudgetSetupPrompt from '@/components/budget/BudgetSetupPrompt';
import BudgetSetupForm from '@/components/budget/BudgetSetupForm';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const { ensureProfileExists, isLoading } = useAppContext();
  
  useEffect(() => {
    // Check if the user has a budget set up
    const checkBudget = async () => {
      // Ensure profile exists first
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      // Check if user has any budget categories
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id')
        .eq('user_id', userData.user.id)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setHasBudget(true);
      } else {
        // Check if user has dismissed the budget prompt
        const dismissedBudget = localStorage.getItem('budgetSetupDismissed');
        if (!dismissedBudget) {
          setShowBudgetSetup(true);
        }
      }
    };
    
    if (!isLoading) {
      checkBudget();
    }
  }, [ensureProfileExists, isLoading]);
  
  const handleBudgetSetupComplete = () => {
    setShowBudgetSetup(false);
    setHasBudget(true);
  };
  
  const handleBudgetSetupDismiss = () => {
    localStorage.setItem('budgetSetupDismissed', 'true');
    setShowBudgetSetup(false);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full md:col-span-2">
          <BalanceCard />
        </div>
        
        <div className="col-span-full md:col-span-1">
          <SavingsGoalsCard />
        </div>
        
        <div className="col-span-full md:col-span-2">
          <RecentExpenses />
        </div>
        
        <div className="col-span-full md:col-span-1">
          <ActiveLoans />
        </div>
        
        <div className="col-span-full">
          <CategoryBreakdown />
        </div>
      </div>
      
      {/* Budget Setup Prompt */}
      {showBudgetSetup && (
        <Sheet open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
          <SheetContent className="sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Budget Setup</SheetTitle>
              <SheetDescription>
                Let's set up your budget to help you manage your finances
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <BudgetSetupForm
                onComplete={handleBudgetSetupComplete}
                onDismiss={handleBudgetSetupDismiss}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Home;
