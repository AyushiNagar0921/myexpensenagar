import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import IncomeSetupForm from '@/components/auth/IncomeSetupForm';
import BudgetSetupPrompt from '@/components/budget/BudgetSetupPrompt';
import BalanceCard from '@/components/dashboard/BalanceCard';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import SavingsGoalCard from '@/components/dashboard/SavingsGoalsCard';
import ActiveLoans from '@/components/dashboard/ActiveLoans';

const Home = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { incomes, expenses, loans, isLoading: dataLoading } = useAppContext();
  const navigate = useNavigate();
  const [spentPercentage, setSpentPercentage] = useState(0);
  const [showBudgetPrompt, setShowBudgetPrompt] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    if (incomes && incomes.length > 0 && expenses && expenses.length > 0) {
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setSpentPercentage(Math.round((totalSpent / totalIncome) * 100));
    } else {
      setSpentPercentage(0);
    }
  }, [incomes, expenses]);
  
  // Check if the budget prompt should be shown based on user preferences
  useEffect(() => {
    if (incomes && incomes.length > 0) {
      const lastPromptDate = localStorage.getItem('lastBudgetPromptDate');
      const schedulePreference = localStorage.getItem('budgetSetupSchedule') || 'never';
      
      if (schedulePreference === 'never') {
        setShowBudgetPrompt(false);
        return;
      }
      
      if (!lastPromptDate) {
        // First time, show the prompt
        setShowBudgetPrompt(true);
        return;
      }
      
      const today = new Date();
      const lastDate = new Date(lastPromptDate);
      
      if (schedulePreference === 'daily') {
        // Show daily if last prompt was yesterday or earlier
        if (today.getDate() !== lastDate.getDate() || 
            today.getMonth() !== lastDate.getMonth() || 
            today.getFullYear() !== lastDate.getFullYear()) {
          setShowBudgetPrompt(true);
        }
      } else if (schedulePreference === 'weekly') {
        // Show weekly if it's been 7 or more days
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
          setShowBudgetPrompt(true);
        }
      } else if (schedulePreference === 'monthly') {
        // Show monthly if it's been a month or more
        if (today.getMonth() !== lastDate.getMonth() || 
            today.getFullYear() !== lastDate.getFullYear()) {
          setShowBudgetPrompt(true);
        }
      }
    }
  }, [incomes]);
  
  const handleBudgetPromptComplete = () => {
    setShowBudgetPrompt(false);
    localStorage.setItem('lastBudgetPromptDate', new Date().toISOString());
  };
  
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  if (!incomes || incomes.length === 0) {
    return <IncomeSetupForm />;
  }

  if (showBudgetPrompt) {
    return <BudgetSetupPrompt onComplete={handleBudgetPromptComplete} />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <BalanceCard />
          <CategoryBreakdown />
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          <RecentExpenses />
          <SavingsGoalCard />
          {loans && loans.length > 0 && <ActiveLoans />}
        </div>
      </div>
    </div>
  );
};

export default Home;
