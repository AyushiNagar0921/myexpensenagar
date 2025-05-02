
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User } from "lucide-react";
import { useAppContext } from '@/contexts/AppContext';
import LoanCard from '@/components/loans/LoanCard';
import LoanForm from '@/components/loans/LoanForm';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';

const Loans = () => {
  const { loans, deleteLoan, isLoading, ensureProfileExists } = useAppContext();
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      await ensureProfileExists();
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Loans & EMIs</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Loans & EMIs</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingLoan} onOpenChange={setIsAddingLoan}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Loan</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <LoanForm onClose={() => setIsAddingLoan(false)} />
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
            className="md:hidden"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {!loans || loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <div className="rounded-full bg-primary/20 p-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No loans or EMIs yet</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Add your loans or EMIs to track your payments and see your progress towards paying them off.
          </p>
          <Button onClick={() => setIsAddingLoan(true)}>Add Your First Loan</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onDelete={deleteLoan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
