
import React from 'react';
import TransactionsTable from '@/components/expenses/TransactionsTable';

const Transactions = () => {
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
