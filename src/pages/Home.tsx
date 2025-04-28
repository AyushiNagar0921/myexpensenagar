
import React from 'react';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import SavingsGoalCard from '@/components/dashboard/SavingsGoalsCard';
import { useAppContext } from '@/contexts/AppContext';
import IncomeSetupForm from '@/components/auth/IncomeSetupForm';

const Home = () => {
  const { income } = useAppContext();
  
  // If user hasn't set up their income, show the setup form
  if (!income) {
    return <IncomeSetupForm />;
  }
  
  return (
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
      
      <div className="grid gap-6 md:grid-cols-1">
        <RecentExpenses />
      </div>
    </div>
  );
};

export default Home;
