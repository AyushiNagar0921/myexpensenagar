
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext, ExpenseCategory, Expense } from '@/contexts/AppContext';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { DataRange } from './types';

const categories: {value: ExpenseCategory | 'all', label: string}[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'travel', label: 'Travel' },
  { value: 'bills', label: 'Bills' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' }
];

// Get category badge color class
const getCategoryColorClass = (category: ExpenseCategory) => {
  switch (category) {
    case 'food':
      return 'bg-category-food text-white';
    case 'shopping':
      return 'bg-category-shopping text-white';
    case 'travel':
      return 'bg-category-travel text-white';
    case 'bills':
      return 'bg-category-bills text-white';
    case 'entertainment':
      return 'bg-category-entertainment text-white';
    case 'health':
      return 'bg-category-health text-white';
    case 'other':
      return 'bg-category-other text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const TransactionsTable = () => {
  const { expenses, deleteExpense } = useAppContext();
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DataRange>({ from: undefined, to: undefined });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  
  // Apply filters to expenses
  const filteredExpenses = expenses.filter(expense => {
    // Filter by category
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && new Date(expense.date) < dateRange.from) {
      return false;
    }
    if (dateRange.to && new Date(expense.date) > dateRange.to) {
      return false;
    }
    
    // Filter by amount range
    const minAmount = amountRange.min !== '' ? parseFloat(amountRange.min) : -Infinity;
    const maxAmount = amountRange.max !== '' ? parseFloat(amountRange.max) : Infinity;
    if (expense.amount < minAmount || expense.amount > maxAmount) {
      return false;
    }
    
    return true;
  });
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
    setAmountRange({ min: '', max: '' });
  };
  
  return (
    <div className="space-y-4">
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
              />
            </PopoverContent>
          </Popover>
          
          {(categoryFilter !== 'all' || searchQuery !== '' || dateRange.from || amountRange.min || amountRange.max) && (
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
            placeholder="Min $" 
            value={amountRange.min} 
            onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
          />
        </div>
        <div className="flex-1 sm:flex-initial sm:w-36">
          <Input 
            type="number" 
            placeholder="Max $" 
            value={amountRange.max} 
            onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
          />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`category-badge ${getCategoryColorClass(expense.category)}`}>
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteExpense(expense.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </Button>
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
