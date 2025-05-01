
import React, { useEffect, useState } from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from "@/components/ui/skeleton";

const AddExpense = () => {
  const { ensureProfileExists, isLoading } = useAppContext();
  const [profileChecked, setProfileChecked] = useState(false);
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      const exists = await ensureProfileExists();
      setProfileChecked(exists);
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  // Show loading state while checking profile
  if (isLoading && !profileChecked) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
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
