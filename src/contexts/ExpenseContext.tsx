
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileContext } from './ProfileContext';
import { useIncomeContext } from './IncomeContext'; 

export type ExpenseCategory = 'Food' | 'Shopping' | 'Transportation' | 'Entertainment' | 'Health' | 'Utilities' | 'Housing' | 'Clothing' | 'Loans' | 'Savings' | 'Healthcare' | 'Other' | string;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Health',
  'Utilities',
  'Savings',
  'Loans',
  'Other'
];

// Centralized category color mapping
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#10B981',
  Shopping: '#6366F1',
  Transportation: '#F59E0B',
  Utilities: '#EF4444',
  Entertainment: '#8B5CF6',
  Health: '#06B6D4',
  Savings: '#6366F1',
  Loans: '#E11D48',
  Other: '#6B7280',
};

// Tailwind utility class for badges
export const getCategoryColorClass = (category: ExpenseCategory): string => {
  switch (category) {
    case 'Food': return 'bg-category-food text-white';
    case 'Shopping': return 'bg-category-shopping text-white';
    case 'Transportation': return 'bg-category-travel text-white';
    case 'Utilities': return 'bg-category-bills text-white';
    case 'Entertainment': return 'bg-category-entertainment text-white';
    case 'Health': return 'bg-category-health text-white';
    case 'Savings': return 'bg-category-savings text-white';
    case 'Loans': return 'bg-category-loans text-white';
    case 'Other': return 'bg-category-other text-white';
    default: return 'bg-gray-200 text-gray-800';
  }
};

// Icon rendering for a category
export const getCategoryIcon = (category: ExpenseCategory): React.ReactNode => {
  const base = (color: string) => (
    <div className={`${color}/20 p-2 rounded-full`}>
      <div className={`h-2 w-2 ${color} rounded-full`}></div>
    </div>
  );

  switch (category) {
    case 'Food': return base('bg-category-food');
    case 'Shopping': return base('bg-category-shopping');
    case 'Transportation': return base('bg-category-travel');
    case 'Utilities': return base('bg-category-bills');
    case 'Entertainment': return base('bg-category-entertainment');
    case 'Health': return base('bg-category-health');
    case 'Savings': return base('bg-category-savings');
    case 'Loans': return base('bg-category-loans');
    case 'Other': return base('bg-category-other');
    default: return base('bg-category-other');
  }
};

export interface Expense {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category: ExpenseCategory;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  fetchExpenses: () => Promise<void>;
  isLoading: boolean;
  EXPENSE_CATEGORIES: ExpenseCategory[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  const incomeContext = useIncomeContext(); 
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setExpenses(
          data.map((expense) => ({
            ...expense,
            date: new Date(expense.date),
            category: expense.category as ExpenseCategory
          }))
        );
      }
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error(error.message || 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      setIsLoading(true);
          // 🔄 Get up-to-date balance
    const totalIncome = incomeContext.incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentRemainingBalance = totalIncome - totalExpenses;

    // ❌ Show error if expense can't be added
    if (expense.amount > currentRemainingBalance || currentRemainingBalance <= 0) {
      toast.error("You don't have enough remaining balance to add this expense.");
      return;
    }
      // Ensure profile exists before proceeding
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          amount: expense.amount,
          date: expense.date.toISOString(),
          description: expense.description,
          category: expense.category,
          user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setExpenses((prevExpenses) => [...prevExpenses, {
        ...data,
        date: new Date(data.date),
        category: data.category as ExpenseCategory
      }]);
      toast.success('Expense added successfully!');
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.message || 'Failed to add expense');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteExpense = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
      toast.success('Expense deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || 'Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        deleteExpense,
        setExpenses,
        fetchExpenses,
        isLoading,
        EXPENSE_CATEGORIES
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
};
