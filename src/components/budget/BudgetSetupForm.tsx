
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudgetContext } from '@/contexts/BudgetContext';
import { toast } from 'sonner';
import { IndianRupee } from 'lucide-react';

// Define the ExpenseCategory enum values directly in this file
const ExpenseCategories = {
  Food: 'Food',
  Housing: 'Housing',
  Transportation: 'Transportation',
  Utilities: 'Utilities',
  Entertainment: 'Entertainment',
  Healthcare: 'Healthcare',
  Clothing: 'Clothing',
  Debt: 'Debt',
  Saving: 'Saving',
  Other: 'Other'
};

interface BudgetSetupFormProps {
  onComplete: () => void;
  onDismiss?: () => void;
}

const BudgetSetupForm: React.FC<BudgetSetupFormProps> = ({ onComplete, onDismiss }) => {
  const [budgetItems, setBudgetItems] = useState({
    Food: 0,
    Housing: 0,
    Transportation: 0,
    Utilities: 0,
    Entertainment: 0,
    Healthcare: 0,
    Clothing: 0,
    Debt: 0,
    Saving: 0,
    Other: 0
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const { saveBudgetCategories, getBudgetCategories, isLoading } = useBudgetContext();

  useEffect(() => {
    // Load budget from database if available, otherwise from local storage as fallback
    const loadBudget = async () => {
      try {
        const categories = await getBudgetCategories();
        
        if (categories && categories.length > 0) {
          // Convert from database format to our state format
          const budgetValues = Object.fromEntries(
            categories.map(cat => [cat.category, cat.amount])
          );
          setBudgetItems(prev => ({ ...prev, ...budgetValues }));
          
          // Calculate total
          const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
          setTotalAmount(total);
        } else {
          // Fallback to local storage
          const storedBudget = localStorage.getItem('budget');
          if (storedBudget) {
            const budget = JSON.parse(storedBudget);
            setBudgetItems(budget.amounts || budget); // Handle both old and new format
            setTotalAmount(Object.values(budget.amounts || budget).reduce((a: any, b: any) => a + b, 0));
          }
        }
      } catch (error) {
        console.error("Error loading budget data:", error);
      }
    };
    
    loadBudget();
  }, [getBudgetCategories]);

  const handleInputChange = (category: string, value: string) => {
    const amount = value === '' ? 0 : parseFloat(value);
    
    setBudgetItems(prev => ({
      ...prev,
      [category]: amount
    }));
    
    // Update total
    const newTotal = Object.entries(budgetItems)
      .reduce((total, [key, val]) => {
        return total + (key === category ? amount : val);
      }, 0);
      
    setTotalAmount(newTotal);
  };
  
  const handleSave = async () => {
    try {
      if (isLoading) return;
      
      // Convert budget items to array format for saving
      const categories = Object.entries(budgetItems).map(([category, amount]) => ({
        category,
        amount,
      }));
      
      // Save to database
      await saveBudgetCategories(categories);
      
      // Also save to local storage as backup
      const budget = {
        amounts: budgetItems,
        total: totalAmount
      };
      localStorage.setItem('budget', JSON.stringify(budget));
      
      onComplete();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Budget Allocation</h3>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold">{totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      {Object.keys(budgetItems).map((category) => (
        <div key={category} className="space-y-2">
          <Label htmlFor={`budget-${category}`}>{category}</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IndianRupee className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id={`budget-${category}`}
              type="number"
              min="0"
              step="any"
              className="pl-8"
              value={budgetItems[category as keyof typeof budgetItems] || ''}
              onChange={(e) => handleInputChange(category, e.target.value)}
            />
          </div>
        </div>
      ))}
      
      <div className="flex gap-2 justify-end pt-4">
        {onDismiss && (
          <Button variant="outline" onClick={handleDismiss}>
            Remind Me Later
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Budget'}
        </Button>
      </div>
    </div>
  );
};

export default BudgetSetupForm;
