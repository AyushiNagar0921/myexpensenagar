import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import { ExpenseCategory, EXPENSE_CATEGORIES, getCategoryColorClass  } from '@/contexts/ExpenseContext';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X, ArrowDown, ArrowUp } from "lucide-react";
import { DataRange } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories: {value: ExpenseCategory | 'all', label: string}[] = [
  { value: 'all', label: 'All Categories' },
   ...EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
 
  // { value: 'Food', label: 'Food' },
  // { value: 'Shopping', label: 'Shopping' },
  // { value: 'Transportation', label: 'Transportation' },
  // { value: 'Utilities', label: 'Utilities' },
  // { value: 'Entertainment', label: 'Entertainment' },
  // { value: 'Health', label: 'Health' },
  // { value: 'Savings', label: 'Savings' },
  // { value: 'Loans', label: 'Loans' },
  // { value: 'Other', label: 'Other' }
];

const getCategoryColorClassWrapper = (category: string): string => {
  return getCategoryColorClass(category as ExpenseCategory);
};

const TransactionsTable = () => {
  const { expenses, deleteExpense } = useAppContext();
  const { income } = useAppContext();
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DataRange>({ from: undefined, to: undefined });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [transactionType, setTransactionType] = useState('all'); // 'all', 'expense', 'income'
  
  // Create a combined array of income and expense transactions
  const allIncome = Array.isArray(income) ? income.map(incomeItem => ({
    id: incomeItem.id,
    amount: incomeItem.amount,
    description: incomeItem.description || 'Monthly Income',
    date: incomeItem.date,
    type: 'income' as const
  })) : [];
  
  const allExpenses = expenses.map(expense => ({
    ...expense,
    type: 'expense' as const
  }));
  
  const allTransactions = [...allIncome, ...allExpenses];
  
  // Apply filters to transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    // Filter by transaction type
    if (transactionType !== 'all') {
      if (transactionType === 'expense' && transaction.type !== 'expense') return false;
      if (transactionType === 'income' && transaction.type !== 'income') return false;
    }
    
  // Filter by category (only for expenses)
  if (categoryFilter !== 'all') {
    if (transaction.type !== 'expense') return false; // Exclude incomes if category filter applied
    if ('category' in transaction && transaction.category !== categoryFilter) return false;
  }
  
    // Filter by search query
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && new Date(transaction.date) < dateRange.from) {
      return false;
    }
    if (dateRange.to && new Date(transaction.date) > dateRange.to) {
      return false;
    }
    
    // Filter by amount range
    const minAmount = amountRange.min !== '' ? parseFloat(amountRange.min) : -Infinity;
    const maxAmount = amountRange.max !== '' ? parseFloat(amountRange.max) : Infinity;
    if (transaction.amount < minAmount || transaction.amount > maxAmount) {
      return false;
    }
    
    return true;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
    setAmountRange({ min: '', max: '' });
    setTransactionType('all');
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={transactionType} onValueChange={setTransactionType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {transactionType !== 'income' && (
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ExpenseCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange as any}
                numberOfMonths={1}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {(categoryFilter !== 'all' || searchQuery !== '' || dateRange.from || amountRange.min || amountRange.max || transactionType !== 'all') && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="flex-1 sm:flex-initial sm:w-36">
          <Input 
            type="number" 
            placeholder="Min ₹" 
            value={amountRange.min} 
            onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
          />
        </div>
        <div className="flex-1 sm:flex-initial sm:w-36">
          <Input 
            type="number" 
            placeholder="Max ₹" 
            value={amountRange.max} 
            onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
          />
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium ">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium ">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium ">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium ">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium ">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.type === 'income' ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          Income
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Expense
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.type === 'expense' && 'category' in transaction ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getCategoryColorClass(transaction.category)}`}>
                          {transaction.category}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {transaction.type === 'expense' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteExpense(transaction.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
