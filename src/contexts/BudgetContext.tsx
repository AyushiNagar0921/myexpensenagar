
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExpenseCategory } from './ExpenseContext';
import { useProfileContext } from './ProfileContext';

export interface BudgetCategory {
  category: ExpenseCategory;
  amount: number;
  percentage?: number; // Make percentage optional to maintain backward compatibility
}

interface BudgetContextType {
  saveBudgetCategories: (categories: BudgetCategory[]) => Promise<void>;
  getBudgetCategories: () => Promise<BudgetCategory[]>;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  
  const getBudgetCategories = async (): Promise<BudgetCategory[]> => {
    try {
      setIsLoading(true);
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      // Fetch budget categories
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user_id);
      
      if (error) throw error;
      
      return data.map(item => ({
        category: item.category,
        amount: item.amount,
        percentage: item.percentage
      }));
    } catch (error: any) {
      console.error('Error fetching budget categories:', error);
      toast.error(error.message || 'Failed to fetch budget categories');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveBudgetCategories = async (categories: BudgetCategory[]) => {
    try {
      setIsLoading(true);
      
      // Ensure profile exists before proceeding
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      // First delete existing budget categories
      const { error: deleteError } = await supabase
        .from('budget_categories')
        .delete()
        .eq('user_id', user_id);
      
      if (deleteError) throw deleteError;
      
      // Then insert new categories
      const categoriesToInsert = categories.map(cat => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage || 0, // Use 0 as default for percentage
        user_id
      }));
      
      const { error: insertError } = await supabase
        .from('budget_categories')
        .insert(categoriesToInsert);
      
      if (insertError) throw insertError;
      
      toast.success('Budget categories saved successfully!');
    } catch (error: any) {
      console.error('Error saving budget categories:', error);
      toast.error(error.message || 'Failed to save budget categories');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        saveBudgetCategories,
        getBudgetCategories,
        isLoading
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};
