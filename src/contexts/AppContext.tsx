
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

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
  name?: string;
}

export interface Income {
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

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  income: Income | null;
  expenses: Expense[];
  savingGoals: SavingGoal[];
  loans: Loan[];
  remainingBalance: number;
  setUser: (user: User | null) => void;
  setIncome: (income: Income) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateSavingGoalAmount: (id: string, amount: number) => void;
  updateLoanPayment: (id: string, amount: number) => void;
  deleteExpense: (id: string) => void;
  deleteSavingGoal: (id: string) => void;
  deleteLoan: (id: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample user data for demo
const sampleData = {
  user: { id: '1', email: 'demo@example.com', name: 'Demo User' },
  income: { amount: 5000, date: new Date(), description: 'Monthly Salary' },
  expenses: [
    { 
      id: '1', 
      amount: 120, 
      category: 'food' as ExpenseCategory, 
      description: 'Grocery shopping', 
      date: new Date(Date.now() - 86400000) 
    },
    { 
      id: '2', 
      amount: 55, 
      category: 'entertainment' as ExpenseCategory, 
      description: 'Movie tickets', 
      date: new Date(Date.now() - 172800000) 
    },
    { 
      id: '3', 
      amount: 200, 
      category: 'bills' as ExpenseCategory, 
      description: 'Electricity bill', 
      date: new Date(Date.now() - 259200000) 
    },
  ],
  savingGoals: [
    { 
      id: '1', 
      title: 'Vacation to Bali', 
      targetAmount: 2000, 
      currentAmount: 500, 
      deadline: new Date(Date.now() + 7776000000) // 90 days in the future
    }
  ],
  loans: [
    { 
      id: '1', 
      title: 'Car Loan', 
      totalAmount: 12000, 
      remainingAmount: 8500, 
      monthlyPayment: 350, 
      dueDay: 15, 
      nextPaymentDate: new Date(new Date().setDate(15))
    }
  ]
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // In a real app, we would fetch this data from a database
  const [user, setUser] = useState<User | null>(null);
  const [income, setIncome] = useState<Income | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  
  // For demo purposes, load sample data
  useEffect(() => {
    // In a real app, this would be replaced with an API call or database query
    const loadSampleData = () => {
      if (localStorage.getItem('dreamtracker-demo-loaded') !== 'true') {
        setUser(sampleData.user);
        setIncome(sampleData.income);
        setExpenses(sampleData.expenses);
        setSavingGoals(sampleData.savingGoals);
        setLoans(sampleData.loans);
        localStorage.setItem('dreamtracker-demo-loaded', 'true');
      } else {
        // Load from localStorage if available
        const storedUser = localStorage.getItem('dreamtracker-user');
        const storedIncome = localStorage.getItem('dreamtracker-income');
        const storedExpenses = localStorage.getItem('dreamtracker-expenses');
        const storedSavingGoals = localStorage.getItem('dreamtracker-saving-goals');
        const storedLoans = localStorage.getItem('dreamtracker-loans');
        
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedIncome) setIncome(JSON.parse(storedIncome));
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses);
          setExpenses(parsedExpenses.map((exp: any) => ({
            ...exp,
            date: new Date(exp.date)
          })));
        }
        if (storedSavingGoals) {
          const parsedGoals = JSON.parse(storedSavingGoals);
          setSavingGoals(parsedGoals.map((goal: any) => ({
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined
          })));
        }
        if (storedLoans) {
          const parsedLoans = JSON.parse(storedLoans);
          setLoans(parsedLoans.map((loan: any) => ({
            ...loan,
            nextPaymentDate: new Date(loan.nextPaymentDate)
          })));
        }
      }
    };
    
    loadSampleData();
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) localStorage.setItem('dreamtracker-user', JSON.stringify(user));
    if (income) localStorage.setItem('dreamtracker-income', JSON.stringify(income));
    localStorage.setItem('dreamtracker-expenses', JSON.stringify(expenses));
    localStorage.setItem('dreamtracker-saving-goals', JSON.stringify(savingGoals));
    localStorage.setItem('dreamtracker-loans', JSON.stringify(loans));
  }, [user, income, expenses, savingGoals, loans]);
  
  // Calculate remaining balance
  const remainingBalance = React.useMemo(() => {
    const totalIncome = income?.amount || 0;
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const totalLoanPayments = loans.reduce((total, loan) => total + loan.monthlyPayment, 0);
    
    return totalIncome - totalExpenses - totalLoanPayments;
  }, [income, expenses, loans]);
  
  // Methods for updating state
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExpenses([newExpense, ...expenses]);
    toast.success("Expense added successfully");
  };
  
  const addSavingGoal = (goal: Omit<SavingGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSavingGoals([...savingGoals, newGoal]);
    toast.success("Saving goal added successfully");
  };
  
  const addLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan = {
      ...loan,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLoans([...loans, newLoan]);
    toast.success("Loan added successfully");
  };
  
  const updateSavingGoalAmount = (id: string, amount: number) => {
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
    setSavingGoals(updatedGoals);
    toast.success("Saving goal updated");
  };
  
  const updateLoanPayment = (id: string, amount: number) => {
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
    setLoans(updatedLoans);
    toast.success("Loan payment updated");
  };
  
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast.success("Expense removed");
  };
  
  const deleteSavingGoal = (id: string) => {
    setSavingGoals(savingGoals.filter(goal => goal.id !== id));
    toast.success("Saving goal removed");
  };
  
  const deleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
    toast.success("Loan removed");
  };
  
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
      remainingBalance,
      setUser,
      setIncome,
      addExpense,
      addSavingGoal,
      addLoan,
      updateSavingGoalAmount,
      updateLoanPayment,
      deleteExpense,
      deleteSavingGoal,
      deleteLoan,
      logout
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
