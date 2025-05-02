
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileContext } from './ProfileContext';

export type ExpenseCategory = 'Food' | 'Shopping' | 'Transportation' | 'Entertainment' | 'Health' | 'Utilities' | 'Other' | string;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Health',
  'Utilities',
  'Other'
];

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
  EXPENSE_CATEGORIES: ExpenseCategory[]; // Add this to the interface
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  
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
        EXPENSE_CATEGORIES // Add this to the provider value
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
