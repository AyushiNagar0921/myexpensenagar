
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ExpenseCategory, useAppContext } from '@/contexts/AppContext';
import { toast } from "sonner";

interface BudgetItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

interface BudgetSetupProps {
  onComplete: () => void;
}

const INITIAL_BUDGET: BudgetItem[] = [
  { category: 'Food', amount: 0, percentage: 25 },
  { category: 'Shopping', amount: 0, percentage: 15 },
  { category: 'Transportation', amount: 0, percentage: 25 },
  { category: 'Utilities', amount: 0, percentage: 10 },
  { category: 'Entertainment', amount: 0, percentage: 10 },
  { category: 'Health', amount: 0, percentage: 10 },
  { category: 'Other', amount: 0, percentage: 5 },
];

const getCategoryLabel = (category: ExpenseCategory): string => {
  switch (category) {
    case 'Food':
      return 'Food & Groceries';
    case 'Shopping':
      return 'Shopping';
    case 'Transportation':
      return 'Travel & Transportation';
    case 'Utilities':
      return 'Bills & Utilities';
    case 'Entertainment':
      return 'Entertainment';
    case 'Health':
      return 'Health & Wellness';
    case 'Other':
      return 'Others';
    default:
      return category;
  }
};

const getCategoryColor = (category: ExpenseCategory): string => {
  switch (category) {
    case 'Food':
      return 'bg-category-food';
    case 'Shopping':
      return 'bg-category-shopping';
    case 'Transportation':
      return 'bg-category-travel';
    case 'Utilities':
      return 'bg-category-bills';
    case 'Entertainment':
      return 'bg-category-entertainment';
    case 'Health':
      return 'bg-category-health';
    case 'Other':
      return 'bg-category-other';
    default:
      return 'bg-gray-400';
  }
};

const BudgetSetupForm: React.FC<BudgetSetupProps> = ({ onComplete }) => {
  const { income, saveBudgetCategories } = useAppContext();
  const [totalBudget, setTotalBudget] = useState(income?.amount || 0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    // Calculate initial amounts based on percentages
    return INITIAL_BUDGET.map(item => ({
      ...item,
      amount: Math.floor((item.percentage / 100) * totalBudget)
    }));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Update budget distribution
  const updateBudget = (index: number, percentage: number) => {
    const newBudgetItems = [...budgetItems];
    
    // Update the selected budget item
    newBudgetItems[index] = {
      ...newBudgetItems[index],
      percentage,
      amount: Math.floor((percentage / 100) * totalBudget)
    };
    
    // Calculate total percentage used so far
    const totalPercentage = newBudgetItems.reduce(
      (total, item) => total + item.percentage,
      0
    );
    
    // Adjust other categories proportionally if over 100%
    if (totalPercentage > 100) {
      const excess = totalPercentage - 100;
      const otherItems = newBudgetItems.filter((_, i) => i !== index);
      const otherPercentageTotal = otherItems.reduce(
        (total, item) => total + item.percentage,
        0
      );
      
      // Distribute the excess proportionally among other categories
      if (otherPercentageTotal > 0) {
        newBudgetItems.forEach((item, i) => {
          if (i !== index) {
            const reductionRatio = item.percentage / otherPercentageTotal;
            const reduction = excess * reductionRatio;
            
            item.percentage = Math.max(0, item.percentage - reduction);
            item.amount = Math.floor((item.percentage / 100) * totalBudget);
          }
        });
      }
    }
    
    setBudgetItems(newBudgetItems);
  };
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - budgetItems.reduce(
    (total, item) => total + item.amount,
    0
  );
  
  // Calculate total percentage allocated
  const totalPercentageAllocated = budgetItems.reduce(
    (total, item) => total + item.percentage,
    0
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(totalPercentageAllocated - 100) > 0.5) {
      toast.error('Total percentage allocation should be 100%');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save budget categories to Supabase
      await saveBudgetCategories(budgetItems.map(item => ({
        category: item.category,
        amount: item.amount,
        percentage: item.percentage
      })));
      
      toast.success('Budget has been set up successfully');
      onComplete();
    } catch (error) {
      console.error('Error setting up budget:', error);
      toast.error('Failed to set up budget');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Set Up Your Budget</CardTitle>
        <CardDescription>
          Allocate your monthly income across different spending categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-medium">Total Monthly Budget</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <Input
                className="pl-8"
                type="number"
                value={totalBudget}
                onChange={(e) => {
                  const newTotal = parseFloat(e.target.value) || 0;
                  setTotalBudget(newTotal);
                  
                  // Update all budget items based on their current percentages
                  setBudgetItems(prev => 
                    prev.map(item => ({
                      ...item,
                      amount: Math.floor((item.percentage / 100) * newTotal)
                    }))
                  );
                }}
              />
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Budget Allocation</h3>
              <div className="text-sm">
                <span className={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}>
                  {totalPercentageAllocated.toFixed(1)}% allocated
                </span>
              </div>
            </div>
            
            {/* Progress bar showing overall allocation */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${totalPercentageAllocated <= 100 ? 'bg-primary' : 'bg-red-500'}`}
                style={{ width: `${Math.min(totalPercentageAllocated, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {budgetItems.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(item.category)}`}></div>
                    <Label className="font-medium">{getCategoryLabel(item.category)}</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
                <Slider
                  defaultValue={[item.percentage]}
                  min={0}
                  max={100}
                  step={1}
                  value={[item.percentage]}
                  onValueChange={(values) => updateBudget(index, values[0])}
                  className={`${getCategoryColor(item.category)}/30`}
                />
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Budget Settings...' : 'Save Budget Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BudgetSetupForm;
