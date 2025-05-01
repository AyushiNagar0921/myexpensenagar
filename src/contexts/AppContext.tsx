
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Income {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category: ExpenseCategory;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
}

export interface Loan {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  nextPaymentDate: Date;
}

export interface BudgetCategory {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export type ExpenseCategory = 'Food' | 'Shopping' | 'Transportation' | 'Entertainment' | 'Health' | 'Utilities' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Health',
  'Utilities',
  'Other'
];

interface AppContextType {
  incomes: Income[];
  expenses: Expense[];
  savingGoals: SavingGoal[];
  loans: Loan[];
  income?: Income;
  remainingBalance: number;
  addIncome: (income: Omit<Income, "id">) => Promise<void>;
  setIncome: (incomeData: Omit<Income, "id">) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, "id">) => Promise<void>;
  updateSavingGoal: (goal: SavingGoal) => Promise<void>;
  updateSavingGoalAmount: (id: string, amount: number) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  addLoan: (loan: Omit<Loan, "id">) => Promise<void>;
  updateLoanPayment: (loanId: string, paymentAmount: number) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  saveBudgetCategories: (categories: BudgetCategory[]) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  profileExists: boolean;
  ensureProfileExists: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  
  // Calculate remaining balance
  const income = incomes.length > 0 ? incomes[0] : undefined;
  const totalIncome = income ? income.amount : 0;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = totalIncome - totalSpent;
  
  // Ensure user profile exists
  const ensureProfileExists = async () => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error('No authenticated user found');
        return false;
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single();
        
      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userData.user.id }]);
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return false;
        }
        setProfileExists(true);
        return true;
      }
      
      setProfileExists(!!profileData);
      return !!profileData;
    } catch (error) {
      console.error('Error checking/creating user profile:', error);
      return false;
    }
  };
  
  useEffect(() => {
    // First ensure the user profile exists
    const checkProfile = async () => {
      await ensureProfileExists();
      
      // Then fetch data
      fetchIncomes();
      fetchExpenses();
      fetchSavingGoals();
      fetchLoans();
    };
    
    checkProfile();
  }, []);
  
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
  
  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('due_day', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setLoans(
          data.map((loan) => ({
            id: loan.id,
            title: loan.title,
            totalAmount: loan.total_amount,
            remainingAmount: loan.remaining_amount,
            monthlyPayment: loan.monthly_payment,
            dueDay: loan.due_day,
            nextPaymentDate: new Date(loan.next_payment_date)
          }))
        );
      }
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      toast.error(error.message || 'Failed to fetch loans');
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
      
      setIncomes((prevIncomes) => [...prevIncomes, {
        ...data,
        date: new Date(data.date)
      }]);
      toast.success('Income added successfully!');
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.message || 'Failed to add income');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setIncome = async (incomeData: Omit<Income, "id">): Promise<void> => {
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
          amount: incomeData.amount,
          date: incomeData.date.toISOString(),
          description: incomeData.description,
          category: incomeData.category,
          user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setIncomes((prevIncomes) => [...prevIncomes, {
        ...data,
        date: new Date(data.date)
      }]);
      
    } catch (error: any) {
      console.error('Error setting income:', error);
      toast.error(error.message || 'Failed to set income');
      throw error;
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
  
  const addSavingGoal = async (goal: Omit<SavingGoal, "id">) => {
    try {
      setIsLoading(true);
      
      // Ensure profile exists before proceeding
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      const { data, error } = await supabase
        .from('saving_goals')
        .insert({
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline ? goal.deadline.toISOString() : null,
          user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSavingGoals((prevGoals) => [...prevGoals, {
        id: data.id,
        title: data.title,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        deadline: data.deadline ? new Date(data.deadline) : undefined
      }]);
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
          deadline: goal.deadline ? goal.deadline.toISOString() : null
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
  
  const updateSavingGoalAmount = async (id: string, amount: number) => {
    try {
      setIsLoading(true);
      
      const goal = savingGoals.find((g) => g.id === id);
      if (!goal) throw new Error('Goal not found');
      
      const newCurrentAmount = goal.currentAmount + amount;
      
      const { error } = await supabase
        .from('saving_goals')
        .update({
          current_amount: newCurrentAmount
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setSavingGoals((prevGoals) =>
        prevGoals.map((g) => (g.id === id ? { ...g, currentAmount: newCurrentAmount } : g))
      );
      toast.success('Contribution added successfully!');
    } catch (error: any) {
      console.error('Error updating saving goal amount:', error);
      toast.error(error.message || 'Failed to update saving goal amount');
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

  const addLoan = async (loan: Omit<Loan, "id">) => {
    try {
      setIsLoading(true);
      
      // Ensure profile exists before proceeding
      await ensureProfileExists();
      
      // Get user session for user_id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');
      const user_id = userData.user.id;
      
      const { data, error } = await supabase
        .from('loans')
        .insert({
          title: loan.title,
          total_amount: loan.totalAmount,
          remaining_amount: loan.remainingAmount,
          monthly_payment: loan.monthlyPayment,
          due_day: loan.dueDay,
          next_payment_date: loan.nextPaymentDate.toISOString(),
          user_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setLoans((prevLoans) => [...prevLoans, {
        id: data.id,
        title: data.title,
        totalAmount: data.total_amount,
        remainingAmount: data.remaining_amount,
        monthlyPayment: data.monthly_payment,
        dueDay: data.due_day,
        nextPaymentDate: new Date(data.next_payment_date)
      }]);
      toast.success('Loan added successfully!');
    } catch (error: any) {
      console.error('Error adding loan:', error);
      toast.error(error.message || 'Failed to add loan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoanPayment = async (loanId: string, paymentAmount: number) => {
    try {
      setIsLoading(true);
      
      // Find the current loan
      const loan = loans.find(loan => loan.id === loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      // Calculate new remaining amount
      const newRemainingAmount = Math.max(0, loan.remainingAmount - paymentAmount);
      
      // Calculate next payment date (1 month from now)
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      nextPaymentDate.setDate(loan.dueDay);
      
      const { error } = await supabase
        .from('loans')
        .update({
          remaining_amount: newRemainingAmount,
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', loanId);
      
      if (error) throw error;
      
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === loanId
            ? {
                ...loan,
                remainingAmount: newRemainingAmount,
                nextPaymentDate
              }
            : loan
        )
      );
      
      toast.success(`Payment of ₹${paymentAmount} made successfully!`);
    } catch (error: any) {
      console.error('Error updating loan payment:', error);
      toast.error(error.message || 'Failed to update loan payment');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== id));
      toast.success('Loan deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting loan:', error);
      toast.error(error.message || 'Failed to delete loan');
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
        percentage: cat.percentage,
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

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      // Clear local state
      setIncomes([]);
      setExpenses([]);
      setSavingGoals([]);
      setLoans([]);
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
        loans,
        income,
        remainingBalance,
        addIncome,
        setIncome,
        addExpense,
        deleteExpense,
        addSavingGoal,
        updateSavingGoal,
        updateSavingGoalAmount,
        deleteSavingGoal,
        addLoan,
        updateLoanPayment,
        deleteLoan,
        saveBudgetCategories,
        logout,
        isLoading,
        profileExists,
        ensureProfileExists,
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
