
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Define our data types
export type ExpenseCategory = 
  | 'food' 
  | 'shopping' 
  | 'travel' 
  | 'bills' 
  | 'entertainment' 
  | 'health' 
  | 'other';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

export interface Income {
  id: string;
  amount: number;
  date: Date;
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
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
  id: string;
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  income: Income | null;
  expenses: Expense[];
  savingGoals: SavingGoal[];
  loans: Loan[];
  budgetCategories: BudgetCategory[];
  remainingBalance: number;
  setUser: (user: User | null) => void;
  setIncome: (income: Income) => void;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  updateSavingGoalAmount: (id: string, amount: number) => Promise<void>;
  updateLoanPayment: (id: string, amount: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  saveBudgetCategories: (categories: Omit<BudgetCategory, 'id'>[]) => Promise<void>;
  fetchBudgetCategories: () => Promise<void>;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, session } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [income, setIncomeState] = useState<Income | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Format date for database storage
  const formatDateForDB = (date: Date) => {
    return new Date(date).toISOString();
  };
  
  // Parse date from database
  const parseDate = (dateStr: string) => {
    return new Date(dateStr);
  };

  // Fetch budget categories
  const fetchBudgetCategories = async () => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      if (data) {
        setBudgetCategories(
          data.map(category => ({
            id: category.id,
            category: category.category as ExpenseCategory,
            amount: category.amount,
            percentage: category.percentage
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      toast.error('Failed to fetch budget data');
    }
  };

  // Save budget categories
  const saveBudgetCategories = async (categories: Omit<BudgetCategory, 'id'>[]) => {
    if (!authUser?.id) return;
    
    try {
      // First delete existing categories
      const { error: deleteError } = await supabase
        .from('budget_categories')
        .delete()
        .eq('user_id', authUser.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert new ones
      for (const category of categories) {
        const { error } = await supabase
          .from('budget_categories')
          .insert({
            user_id: authUser.id,
            category: category.category,
            amount: category.amount,
            percentage: category.percentage
          });
          
        if (error) throw error;
      }
      
      // Fetch updated categories
      await fetchBudgetCategories();
      toast.success('Budget settings saved successfully');
    } catch (error) {
      console.error('Error saving budget categories:', error);
      toast.error('Failed to save budget settings');
    }
  };
  
  // Fetch all user data from Supabase
  const fetchUserData = async () => {
    if (!authUser?.id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      if (incomeError && incomeError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching income:', incomeError);
        toast.error('Failed to fetch income data');
      } else if (incomeData) {
        setIncomeState({
          id: incomeData.id,
          amount: incomeData.amount,
          date: parseDate(incomeData.date),
          description: incomeData.description || undefined
        });
      }
      
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });
      
      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
        toast.error('Failed to fetch expenses data');
      } else {
        setExpenses(
          expensesData.map(expense => ({
            id: expense.id,
            amount: expense.amount,
            category: expense.category as ExpenseCategory,
            description: expense.description || '',
            date: parseDate(expense.date)
          }))
        );
      }
      
      // Fetch saving goals
      const { data: savingGoalsData, error: savingGoalsError } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (savingGoalsError) {
        console.error('Error fetching saving goals:', savingGoalsError);
        toast.error('Failed to fetch saving goals data');
      } else {
        setSavingGoals(
          savingGoalsData.map(goal => ({
            id: goal.id,
            title: goal.title,
            targetAmount: goal.target_amount,
            currentAmount: goal.current_amount,
            deadline: goal.deadline ? parseDate(goal.deadline) : undefined
          }))
        );
      }
      
      // Fetch loans
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (loansError) {
        console.error('Error fetching loans:', loansError);
        toast.error('Failed to fetch loans data');
      } else {
        setLoans(
          loansData.map(loan => ({
            id: loan.id,
            title: loan.title,
            totalAmount: loan.total_amount,
            remainingAmount: loan.remaining_amount,
            monthlyPayment: loan.monthly_payment,
            dueDay: loan.due_day,
            nextPaymentDate: parseDate(loan.next_payment_date)
          }))
        );
      }

      // Fetch budget categories
      await fetchBudgetCategories();
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set income
  const setIncome = async (incomeData: Income) => {
    if (!authUser?.id) return;
    
    try {
      // Check if there's an existing income
      if (incomeData.id) {
        // Update existing income
        const { error } = await supabase
          .from('income')
          .update({
            amount: incomeData.amount,
            date: formatDateForDB(incomeData.date),
            description: incomeData.description || null
          })
          .eq('id', incomeData.id);
          
        if (error) throw error;
      } else {
        // Insert new income
        const { error, data } = await supabase
          .from('income')
          .insert({
            user_id: authUser.id,
            amount: incomeData.amount,
            date: formatDateForDB(incomeData.date),
            description: incomeData.description || null
          })
          .select()
          .single();
          
        if (error) throw error;
        
        incomeData.id = data.id;
      }
      
      setIncomeState(incomeData);
      toast.success('Income updated successfully');
    } catch (error: any) {
      console.error('Error setting income:', error);
      toast.error(error.message || 'Failed to update income');
    }
  };

  // Add new income source
  const addIncome = async (incomeData: Omit<Income, 'id'>) => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          user_id: authUser.id,
          amount: incomeData.amount,
          date: formatDateForDB(incomeData.date),
          description: incomeData.description || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newIncome = {
        id: data.id,
        amount: data.amount,
        date: parseDate(data.date),
        description: data.description || undefined
      };
      
      // Update the main income if this is the first one
      if (!income) {
        setIncomeState(newIncome);
      }
      
      toast.success("Income added successfully");
      return newIncome;
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.message || 'Failed to add income');
      throw error;
    }
  };
  
  // Add expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: authUser.id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: formatDateForDB(expense.date)
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newExpense = {
        ...expense,
        id: data.id
      };
      
      setExpenses([newExpense, ...expenses]);
      toast.success("Expense added successfully");
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.message || 'Failed to add expense');
      throw error;
    }
  };
  
  // Add saving goal
  const addSavingGoal = async (goal: Omit<SavingGoal, 'id'>) => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('saving_goals')
        .insert({
          user_id: authUser.id,
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline ? formatDateForDB(goal.deadline) : null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newGoal = {
        ...goal,
        id: data.id
      };
      
      setSavingGoals([...savingGoals, newGoal]);
      toast.success("Saving goal added successfully");
    } catch (error: any) {
      console.error('Error adding saving goal:', error);
      toast.error(error.message || 'Failed to add saving goal');
      throw error;
    }
  };
  
  // Add loan
  const addLoan = async (loan: Omit<Loan, 'id'>) => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          user_id: authUser.id,
          title: loan.title,
          total_amount: loan.totalAmount,
          remaining_amount: loan.remainingAmount,
          monthly_payment: loan.monthlyPayment,
          due_day: loan.dueDay,
          next_payment_date: formatDateForDB(loan.nextPaymentDate)
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newLoan = {
        ...loan,
        id: data.id
      };
      
      setLoans([...loans, newLoan]);
      toast.success("Loan added successfully");
    } catch (error: any) {
      console.error('Error adding loan:', error);
      toast.error(error.message || 'Failed to add loan');
      throw error;
    }
  };
  
  // Update saving goal amount
  const updateSavingGoalAmount = async (id: string, amount: number) => {
    if (!authUser?.id) return;
    
    try {
      const updatedGoals = savingGoals.map(goal => {
        if (goal.id === id) {
          const newAmount = goal.currentAmount + amount;
          if (newAmount > goal.targetAmount) {
            toast.info("You've reached your saving goal!");
            return { ...goal, currentAmount: goal.targetAmount };
          }
          return { ...goal, currentAmount: newAmount };
        }
        return goal;
      });
      
      const goalToUpdate = updatedGoals.find(goal => goal.id === id);
      if (!goalToUpdate) {
        throw new Error('Goal not found');
      }
      
      const { error } = await supabase
        .from('saving_goals')
        .update({
          current_amount: goalToUpdate.currentAmount
        })
        .eq('id', id)
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      setSavingGoals(updatedGoals);
      toast.success("Saving goal updated");
    } catch (error: any) {
      console.error('Error updating saving goal:', error);
      toast.error(error.message || 'Failed to update saving goal');
      throw error;
    }
  };
  
  // Update loan payment
  const updateLoanPayment = async (id: string, amount: number) => {
    if (!authUser?.id) return;
    
    try {
      const updatedLoans = loans.map(loan => {
        if (loan.id === id) {
          const newAmount = loan.remainingAmount - amount;
          if (newAmount <= 0) {
            toast.success("Congratulations! Loan fully paid off!");
            return { ...loan, remainingAmount: 0 };
          }
          // Update next payment date to next month
          const nextDate = new Date(loan.nextPaymentDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          return { ...loan, remainingAmount: newAmount, nextPaymentDate: nextDate };
        }
        return loan;
      });
      
      const loanToUpdate = updatedLoans.find(loan => loan.id === id);
      if (!loanToUpdate) {
        throw new Error('Loan not found');
      }
      
      const { error } = await supabase
        .from('loans')
        .update({
          remaining_amount: loanToUpdate.remainingAmount,
          next_payment_date: formatDateForDB(loanToUpdate.nextPaymentDate)
        })
        .eq('id', id)
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      setLoans(updatedLoans);
      toast.success("Loan payment updated");
    } catch (error: any) {
      console.error('Error updating loan:', error);
      toast.error(error.message || 'Failed to update loan');
      throw error;
    }
  };
  
  // Delete expense
  const deleteExpense = async (id: string) => {
    if (!authUser?.id) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success("Expense removed");
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || 'Failed to delete expense');
      throw error;
    }
  };
  
  // Delete saving goal
  const deleteSavingGoal = async (id: string) => {
    if (!authUser?.id) return;
    
    try {
      const { error } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      setSavingGoals(savingGoals.filter(goal => goal.id !== id));
      toast.success("Saving goal removed");
    } catch (error: any) {
      console.error('Error deleting saving goal:', error);
      toast.error(error.message || 'Failed to delete saving goal');
      throw error;
    }
  };
  
  // Delete loan
  const deleteLoan = async (id: string) => {
    if (!authUser?.id) return;
    
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.id);
        
      if (error) throw error;
      
      setLoans(loans.filter(loan => loan.id !== id));
      toast.success("Loan removed");
    } catch (error: any) {
      console.error('Error deleting loan:', error);
      toast.error(error.message || 'Failed to delete loan');
      throw error;
    }
  };
  
  // Calculate remaining balance
  const remainingBalance = React.useMemo(() => {
    const totalIncome = income?.amount || 0;
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const totalLoanPayments = loans.reduce((total, loan) => total + loan.monthlyPayment, 0);
    
    return totalIncome - totalExpenses - totalLoanPayments;
  }, [income, expenses, loans]);
  
  // Update user data when auth user changes
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.user_metadata?.username,
        avatarUrl: authUser.user_metadata?.avatar_url
      });
      
      fetchUserData();
    } else {
      setUser(null);
      setIncomeState(null);
      setExpenses([]);
      setSavingGoals([]);
      setLoans([]);
      setBudgetCategories([]);
    }
  }, [authUser?.id]);
  
  const logout = () => {
    setUser(null);
    toast.info("Logged out successfully");
  };
  
  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated: !!user,
      income,
      expenses,
      savingGoals,
      loans,
      budgetCategories,
      remainingBalance,
      setUser,
      setIncome,
      addIncome,
      addExpense,
      addSavingGoal,
      addLoan,
      updateSavingGoalAmount,
      updateLoanPayment,
      deleteExpense,
      deleteSavingGoal,
      deleteLoan,
      saveBudgetCategories,
      fetchBudgetCategories,
      logout,
      fetchUserData,
      isLoading
    }}>
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
