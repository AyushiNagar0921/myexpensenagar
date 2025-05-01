
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useAppContext, ExpenseCategory, EXPENSE_CATEGORIES } from '@/contexts/AppContext';
import { toast } from "sonner";

const categories: {value: ExpenseCategory, label: string}[] = [
  { value: 'Food', label: 'Food' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health', label: 'Health' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Other', label: 'Other' }
];

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { addExpense, ensureProfileExists } = useAppContext();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      const exists = await ensureProfileExists();
      setProfileReady(exists);
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!description) {
      toast.error('Please enter a description');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ensure profile exists before proceeding
      if (!profileReady) {
        const exists = await ensureProfileExists();
        if (!exists) {
          toast.error('Failed to create user profile');
          return;
        }
      }
      
      // Add the new expense
      await addExpense({
        amount: parseFloat(amount),
        category,
        description,
        date: date || new Date()
      });
      
      // Reset form and navigate back to dashboard
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date());
      
      navigate('/');
    } catch (error: any) {
      console.error('Failed to add expense:', error);
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add Expense</CardTitle>
        <CardDescription>Record a new expense to track your spending</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="date"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Adding Expense...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" onClick={() => navigate('/')}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseForm;
