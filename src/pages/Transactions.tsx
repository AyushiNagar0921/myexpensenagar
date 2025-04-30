
import React from 'react';
import TransactionsTable from '@/components/expenses/TransactionsTable';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from "@/components/ui/skeleton";

const Transactions = () => {
  const { isLoading } = useAppContext();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Transactions History</h2>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions History</h2>
      </div>
      
      <TransactionsTable />
    </div>
  );
};

export default Transactions;
