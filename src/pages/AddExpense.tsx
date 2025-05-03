
import React, { useEffect, useState } from 'react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CircleUserRound, User,  } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


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
          className="h-12 w-12"
        >
                <CircleUserRound className="scale-[1.8] text-primary" />

        </Button>
      </div>
    
      <ExpenseForm />
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
          className="h-12 w-12"
        >
                <CircleUserRound className="scale-[1.8] text-primary" />

        </Button>
      </div>
    
      <ExpenseForm />
    </div>
    
  );
};

export default AddExpense;
