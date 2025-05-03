
import React from 'react';
import TransactionsTable from '@/components/expenses/TransactionsTable';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const { isLoading } = useAppContext();
    const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Transactions History</h2>
        </div>    
            <div className=" md:block">
        <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate('/profile')}
        className="h-12 w-12"
      >
              <CircleUserRound className="scale-[1.8] text-primary" />

      </Button>
        </div>
        
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  return (
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <h2 className="text-3xl font-bold tracking-tight">Transactions History</h2>
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => navigate('/profile')}
      className="h-12 w-12"
    >
      <CircleUserRound className="scale-[1.8] text-primary" />
    </Button>
  </div>
  
  <TransactionsTable />
</div>
  );
};

export default Transactions;
