
import React, { useEffect, useState } from 'react';
import IncomeForm from '@/components/income/IncomeForm';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CircleUserRound, User } from "lucide-react";
import { Link } from 'react-router-dom';
import { UserCircle } from "lucide-react"; // better profile icon


const AddIncome = () => {
  const { incomes, isLoading, ensureProfileExists } = useAppContext();
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      const exists = await ensureProfileExists();
      setProfileChecked(exists);
    };
    checkProfile();
  }, [ensureProfileExists]);

  // If data is loading, show a skeleton
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
        </div>
    );
  }
  
  return (

    <div className="space-y-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-3xl font-bold tracking-tight">Add Income</h2>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate('/profile')}
        className="h-12 w-12"
      >
              <CircleUserRound className="scale-[1.8] text-primary" />

      </Button>
    </div>

      <IncomeForm onSuccess={() => navigate('/')} />
    </div>
  );
};

export default AddIncome;
