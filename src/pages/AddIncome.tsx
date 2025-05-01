
import React, { useEffect, useState } from 'react';
import IncomeForm from '@/components/income/IncomeForm';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Add Income</h2>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Add Income</h2>
      <IncomeForm onSuccess={() => navigate('/')} />
    </div>
  );
};

export default AddIncome;
