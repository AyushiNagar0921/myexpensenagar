import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Income {
  id: string;
  amount: number;
  date: Date;
  description?: string;
}

interface Expense {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category: string;
}

interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
}

interface AppContextType {
  incomes: Income[];
  expenses: Expense[];
  savingGoals: SavingGoal[];
  addIncome: (income: Omit<Income, "id">) => Promise<void>;
  setIncome: (incomeData: Omit<Income, "id">) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, "id">) => Promise<void>;
  updateSavingGoal: (goal: SavingGoal) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchIncomes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('incomes')
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
              date: new Date(expense.date)
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
    
    const fetchSavingGoals = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('saving_goals')
          .select('*')
          .order('deadline', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setSavingGoals(
            data.map((goal) => ({
              ...goal,
              deadline: goal.deadline ? new Date(goal.deadline) : undefined
            }))
          );
        }
      } catch (error: any) {
        console.error('Error fetching saving goals:', error);
        toast.error(error.message || 'Failed to fetch saving goals');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIncomes();
    fetchExpenses();
    fetchSavingGoals();
  }, []);
  
  const addIncome = async (income: Omit<Income, "id">) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('incomes')
        .insert([income])
        .select()
        .single();
      
      if (error) throw error;
      
      setIncomes((prevIncomes) => [...prevIncomes, data]);
      toast.success('Income added successfully!');
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.message || 'Failed to add income');
    } finally {
      setIsLoading(false);
    }
  };

  const setIncome = async (incomeData: Omit<Income, "id">): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('incomes')
        .insert([incomeData])
        .select()
        .single();
      
      if (error) throw error;
      
      setIncomes((prevIncomes) => [...prevIncomes, data]);
      
    } catch (error: any) {
      console.error('Error setting income:', error);
      toast.error(error.message || 'Failed to set income');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();
      
      if (error) throw error;
      
      setExpenses((prevExpenses) => [...prevExpenses, data]);
      toast.success('Expense added successfully!');
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addSavingGoal = async (goal: Omit<SavingGoal, "id">) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('saving_goals')
        .insert([goal])
        .select()
        .single();
      
      if (error) throw error;
      
      setSavingGoals((prevGoals) => [...prevGoals, data]);
      toast.success('Saving goal added successfully!');
    } catch (error: any) {
      console.error('Error adding saving goal:', error);
      toast.error(error.message || 'Failed to add saving goal');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSavingGoal = async (goal: SavingGoal) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('saving_goals')
        .update(goal)
        .eq('id', goal.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSavingGoals((prevGoals) =>
        prevGoals.map((g) => (g.id === goal.id ? data : g))
      );
      toast.success('Saving goal updated successfully!');
    } catch (error: any) {
      console.error('Error updating saving goal:', error);
      toast.error(error.message || 'Failed to update saving goal');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteSavingGoal = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSavingGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
      toast.success('Saving goal deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting saving goal:', error);
      toast.error(error.message || 'Failed to delete saving goal');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      // Clear local state
      setIncomes([]);
      setExpenses([]);
      setSavingGoals([]);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        incomes,
        expenses,
        savingGoals,
        addIncome,
        setIncome,
        addExpense,
        addSavingGoal,
        updateSavingGoal,
        deleteSavingGoal,
        logout,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
