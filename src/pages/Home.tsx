
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import IncomeSetupForm from '@/components/auth/IncomeSetupForm';

const Home = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { incomes, expenses, loans, isLoading: dataLoading } = useAppContext();
  const navigate = useNavigate();
  const [spentPercentage, setSpentPercentage] = useState(0);
  
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
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalSpent = expenses ? expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0;
  const remainingAmount = totalIncome - totalSpent;

  // Format currency to INR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
          <CardDescription>Your financial overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Monthly Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Income</p>
                <p className="font-medium">{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Spent</p>
                <p className="font-medium">{formatCurrency(totalSpent)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-medium">{formatCurrency(remainingAmount)}</p>
              </div>
              {loans && loans.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Active Loans</p>
                  <p className="font-medium">{loans.length}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Spending Progress</h3>
            <p className="text-muted-foreground">
              {spentPercentage}% of your income spent
            </p>
            <Progress 
              value={spentPercentage}
              className="h-2 mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
