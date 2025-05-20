import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileContext } from './ProfileContext';
import { useAppContext } from './AppContext';


export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
}

interface SavingGoalContextType {
  savingGoals: SavingGoal[];
  addSavingGoal: (goal: Omit<SavingGoal, "id">) => Promise<void>;
  updateSavingGoal: (goal: SavingGoal) => Promise<void>;
  updateSavingGoalAmount: (id: string, amount: number, goalTitle: string) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  setSavingGoals: React.Dispatch<React.SetStateAction<SavingGoal[]>>;
  fetchSavingGoals: () => Promise<void>;
  isLoading: boolean;
}

const SavingGoalContext = createContext<SavingGoalContextType | undefined>(undefined);

export function SavingGoalProvider({ children }: { children: React.ReactNode }) {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  // const { remainingBalance } = useAppContext(); // Add this at the top

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
            id: goal.id,
            title: goal.title,
            targetAmount: goal.target_amount,
            currentAmount: goal.current_amount,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined,
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

  const addSavingGoal = async (goal: Omit<SavingGoal, "id">) => {
    try {
      setIsLoading(true);
      await ensureProfileExists();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;

      if (goal.currentAmount >= goal.targetAmount) {
        toast.warning('Goal is already met');
        return;
      }

      const { data, error } = await supabase
        .from('saving_goals')
        .insert({
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline ? goal.deadline.toISOString() : null,
          user_id,
        })
        .select()
        .single();

      if (error) throw error;

      setSavingGoals((prevGoals) => [
        ...prevGoals,
        {
          id: data.id,
          title: data.title,
          targetAmount: data.target_amount,
          currentAmount: data.current_amount,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        },
      ]);
      toast.success('Saving goal added successfully!');
    } catch (error: any) {
      console.error('Error adding saving goal:', error);
      toast.error(error.message || 'Failed to add saving goal');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavingGoal = async (goal: SavingGoal) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('saving_goals')
        .update({
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline ? goal.deadline.toISOString() : null,
        })
        .eq('id', goal.id);

      if (error) throw error;

      setSavingGoals((prevGoals) =>
        prevGoals.map((g) => (g.id === goal.id ? goal : g))
      );
      toast.success('Saving goal updated successfully!');
    } catch (error: any) {
      console.error('Error updating saving goal:', error);
      toast.error(error.message || 'Failed to update saving goal');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavingGoalAmount = async (id: string, amount: number, goalTitle: string) => {
    try {
      // if (amount > remainingBalance) {
      //   toast.error("You don't have enough remaining balance to allocate this amount. Please add income first.");
      //   return;
      // }
      setIsLoading(true);
  
      // 1. Update the saving goal amount
      const goal = savingGoals.find((g) => g.id === id);
      if (!goal) throw new Error('Goal not found');
  
      const newCurrentAmount = goal.currentAmount + amount;
  
      const { error: updateError } = await supabase
        .from('saving_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', id);
  
      if (updateError) throw updateError;
  
      setSavingGoals((prevGoals) =>
        prevGoals.map((g) =>
          g.id === id ? { ...g, currentAmount: newCurrentAmount } : g
        )
      );
  
      if (newCurrentAmount >= goal.targetAmount) {
        toast.success('🎉 Goal completed!');
      } else {
        toast.success('Contribution added successfully!');
      }
  
      // 2. Log the expense in the 'expenses' table
      await ensureProfileExists();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
  
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          amount: amount,
          date: new Date().toISOString(), // Use current date for the expense
          description: `Contribution to "${goalTitle}"`,
          category: 'Savings',
          user_id: user_id,
        });
  
      if (expenseError) throw expenseError;
      toast.success('Expense logged successfully!');
  
    } catch (error: any) {
      console.error('Error updating saving goal and logging expense:', error);
      toast.error(error.message || 'Failed to update saving goal and log expense');
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

      setSavingGoals((prevGoals) =>
        prevGoals.filter((goal) => goal.id !== id)
      );
      toast.success('Saving goal deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting saving goal:', error);
      toast.error(error.message || 'Failed to delete saving goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SavingGoalContext.Provider
      value={{
        savingGoals,
        addSavingGoal,
        updateSavingGoal,
        updateSavingGoalAmount,
        deleteSavingGoal,
        setSavingGoals,
        fetchSavingGoals,
        isLoading,
      }}
    >
      {children}
    </SavingGoalContext.Provider>
  );
}

export const useSavingGoalContext = () => {
  const context = useContext(SavingGoalContext);
  if (context === undefined) {
    throw new Error('useSavingGoalContext must be used within a SavingGoalProvider');
  }
  return context;
};
