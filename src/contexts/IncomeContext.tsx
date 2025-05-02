
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileContext } from './ProfileContext';

export interface Income {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category?: string;
}

interface IncomeContextType {
  incomes: Income[];
  income?: Income;
  totalIncome: number;
  addIncome: (income: Omit<Income, "id">) => Promise<void>;
  setIncomes: React.Dispatch<React.SetStateAction<Income[]>>;
  fetchIncomes: () => Promise<void>;
  isLoading: boolean;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export function IncomeProvider({ children }: { children: React.ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  
  // Get the latest income
  const income = incomes.length > 0 ? incomes[0] : undefined;
  
  // Calculate total income from all income sources
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setIncomes(
          data.map((income) => ({
            ...income,
            date: new Date(income.date)
          }))
        );
      }
    } catch (error: any) {
      console.error('Error fetching incomes:', error);
      toast.error(error.message || 'Failed to fetch incomes');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addIncome = async (income: Omit<Income, "id">) => {
    try {
      setIsLoading(true);
      
      // Ensure profile exists before proceeding
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      const { data, error } = await supabase
        .from('income')
        .insert({
          amount: income.amount,
          date: income.date.toISOString(),
          description: income.description,
          category: income.category,
          user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setIncomes((prevIncomes) => [
        {
          ...data,
          date: new Date(data.date)
        },
        ...prevIncomes,
      ]);
      toast.success('Income added successfully!');
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.message || 'Failed to add income');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        income,
        totalIncome,
        addIncome,
        setIncomes,
        fetchIncomes,
        isLoading
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
}

export const useIncomeContext = () => {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncomeContext must be used within an IncomeProvider');
  }
  return context;
};
