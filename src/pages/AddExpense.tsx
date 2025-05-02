
import React, { useEffect, useState } from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const { ensureProfileExists, isLoading } = useAppContext();
  const [profileChecked, setProfileChecked] = useState(false);
  const navigate = useNavigate();
  
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Add Expense</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Add Expense</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/profile')}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
      
      <ExpenseForm />
    </div>
  );
};

export default AddExpense;
