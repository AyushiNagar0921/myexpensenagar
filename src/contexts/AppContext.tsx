
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfileContext, ProfileProvider } from './ProfileContext';
import { useSavingGoalContext, SavingGoalProvider } from './SavingGoalContext';
import { useLoanContext, LoanProvider } from './LoanContext';
import { useIncomeContext, IncomeProvider } from './IncomeContext';
import { useExpenseContext, ExpenseProvider, Expense } from './ExpenseContext';
import { useBudgetContext, BudgetProvider } from './BudgetContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppContextType {
  // Profile
  profileExists: boolean;
  ensureProfileExists: () => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Saving Goals
  savingGoals: any[];
  fetchSavingGoals: () => Promise<void>;
  addSavingGoal: (goal: any) => Promise<void>;
  updateSavingGoal: (id: string, goal: any) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  
  // Loans
  loans: any[];
  fetchLoans: () => Promise<void>;
  addLoan: (loan: any) => Promise<void>;
  updateLoan: (id: string, loan: any) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  
  // Income
  income: any[];
  fetchIncome: () => Promise<void>;
  addIncome: (income: any) => Promise<void>;
  updateIncome: (id: string, income: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Budget
  saveBudgetCategories: (categories: any[]) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  
  // Calculated values
  totalIncome: number;
  remainingBalance: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Create a wrapper component that provides all the context providers
  return (
    <ProfileProvider>
      <SavingGoalProvider>
        <LoanProvider>
          <IncomeProvider>
            <ExpenseProvider>
              <BudgetProvider>
                <AppContextWrapper>{children}</AppContextWrapper>
              </BudgetProvider>
            </ExpenseProvider>
          </IncomeProvider>
        </LoanProvider>
      </SavingGoalProvider>
    </ProfileProvider>
  );
}

function AppContextWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const profileContext = useProfileContext();
  const savingGoalContext = useSavingGoalContext();
  const loanContext = useLoanContext();
  const incomeContext = useIncomeContext();
  const expenseContext = useExpenseContext();
  const budgetContext = useBudgetContext();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all data when user changes
  useEffect(() => {
    const fetchAllData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Ensure profile exists
          await profileContext.ensureProfileExists();
          
          // Fetch all data in parallel
          await Promise.all([
            savingGoalContext.fetchSavingGoals(),
            loanContext.fetchLoans(),
            incomeContext.fetchIncomes(),
            expenseContext.fetchExpenses()
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load your data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAllData();
  }, [user]);
  
  // Calculate total income
  const totalIncome = Array.isArray(incomeContext.income) ? 
    incomeContext.income.reduce((sum: number, inc: any) => sum + inc.amount, 0) : 0;
  
  // Calculate total expenses
  const totalExpenses = expenseContext.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total loan payments (amount already paid)
  const totalLoanPayments = loanContext.loans.reduce((sum, loan) => sum + (loan.totalAmount - loan.remainingAmount), 0);
  
  // Calculate total savings (current saved amount) 
  const totalSavings = savingGoalContext.savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  // Calculate the remaining balance by subtracting all outflows from the total income
  const remainingBalance = totalIncome - (totalExpenses + totalLoanPayments + totalSavings);
  
  // Combine all context values
  const contextValue: AppContextType = {
    // Profile
    profileExists: profileContext.profileExists,
    ensureProfileExists: profileContext.ensureProfileExists,
    logout: profileContext.logout,
    
    // Saving Goals
    savingGoals: savingGoalContext.savingGoals,
    fetchSavingGoals: savingGoalContext.fetchSavingGoals,
    addSavingGoal: savingGoalContext.addSavingGoal,
    updateSavingGoal: savingGoalContext.updateSavingGoal,
    deleteSavingGoal: savingGoalContext.deleteSavingGoal,
    
    // Loans
    loans: loanContext.loans,
    fetchLoans: loanContext.fetchLoans,
    addLoan: loanContext.addLoan,
    updateLoan: loanContext.updateLoanPayment, // Fixed: updateLoan -> updateLoanPayment
    deleteLoan: loanContext.deleteLoan,
    
    // Income
    income: incomeContext.income,
    fetchIncome: incomeContext.fetchIncomes, // Fixed: fetchIncome -> fetchIncomes
    addIncome: incomeContext.addIncome,
    updateIncome: incomeContext.updateIncome, // This needs to be added to IncomeContext
    deleteIncome: incomeContext.deleteIncome, // This needs to be added to IncomeContext
    
    // Expenses
    expenses: expenseContext.expenses,
    fetchExpenses: expenseContext.fetchExpenses,
    addExpense: expenseContext.addExpense,
    deleteExpense: expenseContext.deleteExpense,
    
    // Budget
    saveBudgetCategories: budgetContext.saveBudgetCategories,
    
    // Loading state
    isLoading: isLoading || 
               profileContext.isLoading || 
               savingGoalContext.isLoading || 
               loanContext.isLoading || 
               incomeContext.isLoading || 
               expenseContext.isLoading || 
               budgetContext.isLoading,
    
    // Calculated values
    totalIncome,
    remainingBalance
  };
  
  return (
    <AppContext.Provider value={contextValue}>
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
