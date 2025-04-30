
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useAppContext } from '@/contexts/AppContext';
import { toast } from "sonner";

const LoanForm = ({ onClose }: { onClose: () => void }) => {
  const { addLoan } = useAppContext();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a loan title');
      return;
    }
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid total amount');
      return;
    }
    
    if (!remainingAmount || parseFloat(remainingAmount) <= 0) {
      toast.error('Please enter a valid remaining amount');
      return;
    }
    
    if (!monthlyPayment || parseFloat(monthlyPayment) <= 0) {
      toast.error('Please enter a valid monthly payment');
      return;
    }
    
    if (!dueDay || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
      toast.error('Please enter a valid due day (1-31)');
      return;
    }
    
    const total = parseFloat(totalAmount);
    const remaining = parseFloat(remainingAmount);
    const monthly = parseFloat(monthlyPayment);
    const dueDayInt = parseInt(dueDay);
    
    if (remaining > total) {
      toast.error('Remaining amount cannot be greater than total amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the new loan
      await addLoan({
        title,
        totalAmount: total,
        remainingAmount: remaining,
        monthlyPayment: monthly,
        dueDay: dueDayInt,
        nextPaymentDate
      });
      
      // Reset form and close modal
      setTitle('');
      setTotalAmount('');
      setRemainingAmount('');
      setMonthlyPayment('');
      setDueDay('');
      setNextPaymentDate(new Date());
      onClose();
    } catch (error) {
      console.error('Failed to add loan:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Loan / EMI</CardTitle>
        <CardDescription>Track your loans and monthly payments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Loan Title</Label>
            <Input
              id="title"
              placeholder="Car loan, Home loan, Personal loan, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remainingAmount">Remaining Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="remainingAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">Monthly Payment</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="monthlyPayment"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDay">Due Day (1-31)</Label>
              <Input
                id="dueDay"
                type="number"
                placeholder="15"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Next Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {nextPaymentDate ? format(nextPaymentDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextPaymentDate}
                  onSelect={(date) => date && setNextPaymentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding Loan...' : 'Add Loan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanForm;
