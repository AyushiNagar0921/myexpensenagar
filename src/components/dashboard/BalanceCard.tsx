
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IndianRupee } from "lucide-react";
import { useAppContext } from '@/contexts/AppContext';

const BalanceCard = () => {
  const { totalIncome, expenses, savingGoals, loans, remainingBalance } = useAppContext();
  
  // Calculate all outgoings
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSavings = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLoanPayments = loans.reduce((sum, loan) => sum + (loan.totalAmount - loan.remainingAmount), 0);
  const totalSpent = totalExpenses + totalSavings + totalLoanPayments;
  
  // Calculate percentage spent from total income
  const percentSpent = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-medium">Current Balance</CardTitle>
        <IndianRupee className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">
          {formatCurrency(remainingBalance)}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Income:</span>
            <span>{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Spent:</span>
            <span>{formatCurrency(totalSpent)}</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spending</span>
            <span className="text-muted-foreground">{percentSpent.toFixed(0)}%</span>
          </div>
          <Progress value={percentSpent} className="h-2" />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-muted-foreground mb-2">Breakdown:</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Expenses:</span>
              <span>{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Savings Goals:</span>
              <span>{formatCurrency(totalSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Loan Payments:</span>
              <span>{formatCurrency(totalLoanPayments)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
