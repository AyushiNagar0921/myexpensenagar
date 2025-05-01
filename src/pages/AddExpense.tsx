
import React, { useEffect } from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { useAppContext } from '@/contexts/AppContext';

const AddExpense = () => {
  const { ensureProfileExists } = useAppContext();
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      await ensureProfileExists();
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-4 md:hidden">
        <h2 className="text-3xl font-bold tracking-tight">Add Expense</h2>
      </div>
      
      <ExpenseForm />
    </div>
  );
};

export default AddExpense;
