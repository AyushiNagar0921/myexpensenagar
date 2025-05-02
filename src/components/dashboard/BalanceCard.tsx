import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/contexts/AppContext';

const BalanceCard = () => {
  const { 
    totalIncome, 
    expenses, 
    loans, 
    savingGoals, 
    remainingBalance 
  } = useAppContext();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalLoanPayments = loans.reduce((sum, loan) => sum + (loan.totalAmount - loan.remainingAmount), 0);
  const totalSavings = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalSpent = totalExpenses + totalLoanPayments + totalSavings;
  const spentPercentage = totalIncome > 0 ? Math.min(100, (totalSpent / totalIncome) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">Balance</CardTitle>
        <CardDescription>Your current financial balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(remainingBalance)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Total Spent</p>
            <p className="text-sm font-medium text-red-500">{formatCurrency(totalSpent)}</p>
          </div>
          <Progress value={spentPercentage} className="h-2" />
        </div>

        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Breakdown</h4>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-red-400" />
                <span className="text-sm">Expenses</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(totalExpenses)}</span>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-blue-400" />
                <span className="text-sm">Loan Payments</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(totalLoanPayments)}</span>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-white/40 p-2 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-purple-400" />
                <span className="text-sm">Savings</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(totalSavings)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
