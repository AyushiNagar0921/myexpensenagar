import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfileContext, ProfileProvider } from './ProfileContext';
import { useSavingGoalContext, SavingGoalProvider } from './SavingGoalContext';
import { useLoanContext, LoanProvider } from './LoanContext';
import { useIncomeContext, IncomeProvider } from './IncomeContext';
import { useExpenseContext, ExpenseProvider } from './ExpenseContext';
import { useBudgetContext, BudgetProvider } from './BudgetContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ------------------- Types -------------------
export type SavingGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
};

export type Loan = {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  nextPaymentDate: Date;
};

export type Income = {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  category?: string;
};

import type { Expense } from './ExpenseContext';

interface AppContextType {
  profileExists: boolean;
  ensureProfileExists: () => Promise<boolean>;
  logout: () => Promise<void>;

  savingGoals: SavingGoal[];
  fetchSavingGoals: () => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  updateSavingGoal: (goal: SavingGoal) => Promise<void>;
  updateSavingGoalAmount: (id: string, amount: number, goalTitle: string) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;

  loans: Loan[];
  fetchLoans: () => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  updateLoan: (id: string, loan: any) => Promise<void>;
  updateLoanPayment: (loanId: string, paymentAmount: number, loanTitle: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  income: Income[];
  incomes: Income[];
  fetchIncome: () => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (id: string, income: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  setIncome: (income: Omit<Income, 'id'>) => Promise<void>;

  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  saveBudgetCategories: (categories: any[]) => Promise<void>;

  isLoading: boolean;

  totalIncome: number;
  remainingBalance: number;
}

// ------------------- Context -------------------
const AppContext = createContext<AppContextType | undefined>(undefined);

// ------------------- AppContextWrapper -------------------
function AppContextWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const profileContext = useProfileContext();
  const savingGoalContext = useSavingGoalContext();
  const loanContext = useLoanContext();
  const incomeContext = useIncomeContext();
  const expenseContext = useExpenseContext();
  const budgetContext = useBudgetContext();

  const [isLoading, setIsLoading] = useState(true);

const totalIncome = incomeContext.incomes.reduce((sum, income) => sum + income.amount, 0);
const totalExpenses = expenseContext.expenses.reduce((sum, expense) => sum + expense.amount, 0);
const remainingBalance = totalIncome - totalExpenses;

  const totalSavings = savingGoalContext.savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLoanPayments = loanContext.loans.reduce(
    (sum, loan) => sum + (loan.totalAmount - loan.remainingAmount),
    0
  );
  useEffect(() => {
    const fetchAllData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          await profileContext.ensureProfileExists();
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
      } else {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const contextValue: AppContextType = {
    profileExists: profileContext.profileExists,
    ensureProfileExists: profileContext.ensureProfileExists,
    logout: profileContext.logout,

    savingGoals: savingGoalContext.savingGoals,
    fetchSavingGoals: savingGoalContext.fetchSavingGoals,
    addSavingGoal: savingGoalContext.addSavingGoal,
    updateSavingGoal: savingGoalContext.updateSavingGoal,
    updateSavingGoalAmount: async (id, amount, goalTitle) => {
      if (amount > remainingBalance) {
        toast.error("You don't have enough remaining balance.");
        return;
      }
      await savingGoalContext.updateSavingGoalAmount(id, amount, goalTitle);
    },
    deleteSavingGoal: savingGoalContext.deleteSavingGoal,

    loans: loanContext.loans,
    fetchLoans: loanContext.fetchLoans,
    addLoan: loanContext.addLoan,
    updateLoan: loanContext.updateLoan,
    updateLoanPayment: async (loanId, paymentAmount, loanTitle) => {
      if (paymentAmount > remainingBalance) {
        toast.error("You don't have enough remaining balance to allocate this amount. Please add income first.");
        return;
      }
      await loanContext.updateLoanPayment(loanId, paymentAmount, loanTitle);
    },
    deleteLoan: loanContext.deleteLoan,

    income: incomeContext.incomes,
    incomes: incomeContext.incomes,
    fetchIncome: incomeContext.fetchIncomes,
    addIncome: incomeContext.addIncome,
    updateIncome: (id, income) => Promise.resolve(),
    deleteIncome: (id) => Promise.resolve(),
    setIncome: incomeContext.addIncome,

    expenses: expenseContext.expenses,
    fetchExpenses: expenseContext.fetchExpenses,
    addExpense: expenseContext.addExpense,
    deleteExpense: expenseContext.deleteExpense,

    saveBudgetCategories: budgetContext.saveBudgetCategories,

    isLoading:
      isLoading ||
      profileContext.isLoading ||
      savingGoalContext.isLoading ||
      loanContext.isLoading ||
      incomeContext.isLoading ||
      expenseContext.isLoading ||
      budgetContext.isLoading,

    totalIncome,
    remainingBalance
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// ------------------- Exported AppProvider -------------------
export function AppProvider({ children }: { children: React.ReactNode }) {
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

// ------------------- Hook -------------------
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
