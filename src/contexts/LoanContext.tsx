import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileContext } from './ProfileContext';

export interface Loan {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  nextPaymentDate: Date;
}

interface LoanContextType {
  loans: Loan[];
  addLoan: (loan: Omit<Loan, "id">) => Promise<void>;
  updateLoan: (id: string, loan: any) => Promise<void>;
  updateLoanPayment: (loanId: string, paymentAmount: number) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  fetchLoans: () => Promise<void>;
  isLoading: boolean;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ensureProfileExists } = useProfileContext();
  
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

  const updateLoan = async (id: string, loanData: any) => {
    try {
      setIsLoading(true);
      
      // Format the data for Supabase
      const formattedData = {
        title: loanData.title,
        total_amount: loanData.totalAmount,
        remaining_amount: loanData.remainingAmount,
        monthly_payment: loanData.monthlyPayment,
        due_day: loanData.dueDay,
        next_payment_date: loanData.nextPaymentDate?.toISOString(),
      };
      
      const { error } = await supabase
        .from('loans')
        .update(formattedData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the loans in state
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === id
            ? {
                ...loan,
                ...loanData
              }
            : loan
        )
      );
      
      toast.success('Loan updated successfully!');
    } catch (error: any) {
      console.error('Error updating loan:', error);
      toast.error(error.message || 'Failed to update loan');
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

  return (
    <LoanContext.Provider
      value={{
        loans,
        addLoan,
        updateLoan,
        updateLoanPayment,
        deleteLoan,
        setLoans,
        fetchLoans,
        isLoading
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
