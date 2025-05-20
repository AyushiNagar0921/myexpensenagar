
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { getCategoryIcon, ExpenseCategory  } from '@/contexts/ExpenseContext';

// Format the date to a readable string
const formatDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const expenseDate = new Date(date);
  
  if (expenseDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (expenseDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return expenseDate.toLocaleDateString();
  }
};

const RecentExpenses = () => {
  const { expenses } = useAppContext();
  
  // Get only the 5 most recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {recentExpenses.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No recent expenses</p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(expense.category)}
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} • {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpenses;
