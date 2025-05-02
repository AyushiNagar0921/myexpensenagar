import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import SavingsGoalsCard from '@/components/dashboard/SavingsGoalsCard';
import ActiveLoans from '@/components/dashboard/ActiveLoans';
import BudgetSetupForm from '@/components/budget/BudgetSetupForm';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import logo from '/favicon-96x961.png';

const Home = () => {
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const [justAddedIncome, setJustAddedIncome] = useState(false);
  const { ensureProfileExists, isLoading } = useAppContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    // Check if just added income
    const checkJustAddedIncome = () => {
      const incomeJustAdded = sessionStorage.getItem('incomeJustAdded');
      if (incomeJustAdded === 'true') {
        setJustAddedIncome(true);
        sessionStorage.removeItem('incomeJustAdded');
      }
    };
    
    checkJustAddedIncome();
    
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
        // If income was just added, show budget setup automatically
        if (justAddedIncome) {
          setShowBudgetSetup(true);
        } else {
          // Otherwise check if user has dismissed the budget prompt
          const dismissedBudget = localStorage.getItem('budgetSetupDismissed');
          if (!dismissedBudget) {
            setShowBudgetSetup(true);
          }
        }
      }
    };
    
    if (!isLoading) {
      checkBudget();
    }
  }, [ensureProfileExists, isLoading, justAddedIncome]);
  
  const handleBudgetSetupComplete = () => {
    setShowBudgetSetup(false);
    setHasBudget(true);
  };
  
  const handleBudgetSetupDismiss = () => {
    localStorage.setItem('budgetSetupDismissed', 'true');
    setShowBudgetSetup(false);
  };

  const BudgetSetupContent = (
    <>
      <div className="px-2 md:px-4">
        <BudgetSetupForm
          onComplete={handleBudgetSetupComplete}
          onDismiss={handleBudgetSetupDismiss}
        />
      </div>
    </>
  );
  
  return (
    <>
    {isMobile && (
      <div className="flex items-center px-4 pt-2 pb-5">
  <Link to="/" className="flex items-center space-x-3">
    <img src={logo} alt="Logo" className="h-14 w-14" />
    <span className="font-bold text-4xl gradient-text">Dream Tracker</span>
  </Link>
</div>

    )}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className=" md:block">
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">Profile</Link>
          </Button>
        </div>
      </div>
      
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
      
      {/* Mobile: Use Drawer for budget setup */}
      {showBudgetSetup && isMobile && (
        <Drawer open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Budget Setup</DrawerTitle>
              <DrawerDescription>
                Let's set up your budget to help you manage your finances
              </DrawerDescription>
            </DrawerHeader>
            {BudgetSetupContent}
          </DrawerContent>
        </Drawer>
      )}
      
      {/* Desktop: Use Sheet for budget setup */}
      {showBudgetSetup && !isMobile && (
        <Sheet open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Budget Setup</SheetTitle>
              <SheetDescription>
                Let's set up your budget to help you manage your finances
              </SheetDescription>
            </SheetHeader>
            {BudgetSetupContent}
          </SheetContent>
        </Sheet>
      )}
    </div>
    </>

  );
};

export default Home;
