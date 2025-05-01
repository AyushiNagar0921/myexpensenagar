
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext, ExpenseCategory } from '@/contexts/AppContext';

// Icons for each expense category
const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case 'Food':
      return <div className="bg-category-food/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-food rounded-full"></div></div>;
    case 'Shopping':
      return <div className="bg-category-shopping/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-shopping rounded-full"></div></div>;
    case 'Transportation':
      return <div className="bg-category-travel/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-travel rounded-full"></div></div>;
    case 'Utilities':
      return <div className="bg-category-bills/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-bills rounded-full"></div></div>;
    case 'Entertainment':
      return <div className="bg-category-entertainment/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-entertainment rounded-full"></div></div>;
    case 'Health':
      return <div className="bg-category-health/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-health rounded-full"></div></div>;
    case 'Other':
      return <div className="bg-category-other/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-other rounded-full"></div></div>;
    default:
      return <div className="bg-category-other/20 p-2 rounded-full"><div className="h-2 w-2 bg-category-other rounded-full"></div></div>;
  }
};

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
    <Card className="shadow-md">
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
