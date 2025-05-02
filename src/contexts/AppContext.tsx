
import React, { useEffect } from 'react';
import { ProfileProvider, useProfileContext } from './ProfileContext';
import { IncomeProvider, useIncomeContext } from './IncomeContext';
import { ExpenseProvider, useExpenseContext, EXPENSE_CATEGORIES } from './ExpenseContext';
import { SavingGoalProvider, useSavingGoalContext } from './SavingGoalContext';
import { LoanProvider, useLoanContext } from './LoanContext';
import { BudgetProvider, useBudgetContext } from './BudgetContext';

// Re-export all types from individual contexts
export type { Income } from './IncomeContext';
export type { Expense, ExpenseCategory } from './ExpenseContext';
export { EXPENSE_CATEGORIES } from './ExpenseContext';
export type { SavingGoal } from './SavingGoalContext';
export type { Loan } from './LoanContext';
export type { BudgetCategory } from './BudgetContext';

interface AppContextType {
  // Combine the exports from all contexts
  incomes: ReturnType<typeof useIncomeContext>['incomes'];
  expenses: ReturnType<typeof useExpenseContext>['expenses'];
  savingGoals: ReturnType<typeof useSavingGoalContext>['savingGoals'];
  loans: ReturnType<typeof useLoanContext>['loans'];
  income?: ReturnType<typeof useIncomeContext>['income'];
  totalIncome: ReturnType<typeof useIncomeContext>['totalIncome'];
  remainingBalance: number;
  addIncome: ReturnType<typeof useIncomeContext>['addIncome'];
  setIncome: (incomeData: Omit<ReturnType<typeof useIncomeContext>['incomes'][0], "id">) => Promise<void>;
  addExpense: ReturnType<typeof useExpenseContext>['addExpense'];
  deleteExpense: ReturnType<typeof useExpenseContext>['deleteExpense'];
  addSavingGoal: ReturnType<typeof useSavingGoalContext>['addSavingGoal'];
  updateSavingGoal: ReturnType<typeof useSavingGoalContext>['updateSavingGoal'];
  updateSavingGoalAmount: ReturnType<typeof useSavingGoalContext>['updateSavingGoalAmount'];
  deleteSavingGoal: ReturnType<typeof useSavingGoalContext>['deleteSavingGoal'];
  addLoan: ReturnType<typeof useLoanContext>['addLoan'];
  updateLoanPayment: ReturnType<typeof useLoanContext>['updateLoanPayment'];
  deleteLoan: ReturnType<typeof useLoanContext>['deleteLoan'];
  saveBudgetCategories: ReturnType<typeof useBudgetContext>['saveBudgetCategories'];
  logout: ReturnType<typeof useProfileContext>['logout'];
  isLoading: boolean;
  profileExists: ReturnType<typeof useProfileContext>['profileExists'];
  ensureProfileExists: ReturnType<typeof useProfileContext>['ensureProfileExists'];
  EXPENSE_CATEGORIES: typeof EXPENSE_CATEGORIES;
}

const CombinedContext = React.createContext<AppContextType | undefined>(undefined);

function CombinedProvider({ children }: { children: React.ReactNode }) {
  // Get data from all contexts
  const { 
    incomes, income, totalIncome, addIncome, fetchIncomes, isLoading: incomeLoading 
  } = useIncomeContext();
  
  const { 
    expenses, addExpense, deleteExpense, fetchExpenses, isLoading: expenseLoading, EXPENSE_CATEGORIES 
  } = useExpenseContext();
  
  const {
    savingGoals, addSavingGoal, updateSavingGoal, updateSavingGoalAmount,
    deleteSavingGoal, fetchSavingGoals, isLoading: goalLoading
  } = useSavingGoalContext();
  
  const {
    loans, addLoan, updateLoanPayment, deleteLoan,
    fetchLoans, isLoading: loanLoading
  } = useLoanContext();
  
  const { saveBudgetCategories, isLoading: budgetLoading } = useBudgetContext();
  
  const { 
    profileExists, ensureProfileExists, logout, isLoading: profileLoading 
  } = useProfileContext();
  
  // Calculate total outgoings
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSavings = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalLoanPayments = loans.reduce((sum, loan) => sum + (loan.totalAmount - loan.remainingAmount), 0);
  
  // Calculate remaining balance by subtracting all outgoings from total income
  const totalOutgoings = totalExpenses + totalSavings + totalLoanPayments;
  const remainingBalance = totalIncome - totalOutgoings;
  
  // Determine combined loading state
  const isLoading = incomeLoading || expenseLoading || goalLoading || 
    loanLoading || budgetLoading || profileLoading;
  
  // Function to add an income (same as before but renamed for clarity)
  const setIncome = addIncome;

  useEffect(() => {
    const loadData = async () => {
      // First ensure the user profile exists
      await ensureProfileExists();
      
      // Then fetch all data
      await Promise.all([
        fetchIncomes(),
        fetchExpenses(),
        fetchSavingGoals(),
        fetchLoans()
      ]);
    };
    
    loadData();
  }, []);

  return (
    <CombinedContext.Provider
      value={{
        incomes,
        expenses,
        savingGoals,
        loans,
        income,
        totalIncome,
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
        EXPENSE_CATEGORIES,
      }}
    >
      {children}
    </CombinedContext.Provider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <IncomeProvider>
        <ExpenseProvider>
          <SavingGoalProvider>
            <LoanProvider>
              <BudgetProvider>
                <CombinedProvider>
                  {children}
                </CombinedProvider>
              </BudgetProvider>
            </LoanProvider>
          </SavingGoalProvider>
        </ExpenseProvider>
      </IncomeProvider>
    </ProfileProvider>
  );
}

export const useAppContext = () => {
  const context = React.useContext(CombinedContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
