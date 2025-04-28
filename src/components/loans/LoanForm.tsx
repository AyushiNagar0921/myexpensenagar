
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/contexts/AppContext';
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

const LoanForm: React.FC<Props> = ({ onClose }) => {
  const { addLoan } = useAppContext();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a loan title');
      return;
    }
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error('Please enter a valid loan amount');
      return;
    }
    
    if (!monthlyPayment || parseFloat(monthlyPayment) <= 0) {
      toast.error('Please enter a valid monthly payment');
      return;
    }
    
    const dueDayNum = parseInt(dueDay);
    if (!dueDay || dueDayNum < 1 || dueDayNum > 31) {
      toast.error('Please enter a valid due day (1-31)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate next payment date based on the due day
      const now = new Date();
      let nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), dueDayNum);
      
      // If the due day has already passed this month, set it for next month
      if (nextPaymentDate < now) {
        nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDayNum);
      }
      
      // Add the new loan
      addLoan({
        title,
        totalAmount: parseFloat(totalAmount),
        remainingAmount: parseFloat(totalAmount),
        monthlyPayment: parseFloat(monthlyPayment),
        dueDay: dueDayNum,
        nextPaymentDate
      });
      
      // Reset form and close modal
      setTitle('');
      setTotalAmount('');
      setMonthlyPayment('');
      setDueDay('');
      onClose();
    } catch (error) {
      toast.error('Failed to add loan');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Loan or EMI</CardTitle>
        <CardDescription>Track your loans and monthly payments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Loan Title</Label>
            <Input
              id="title"
              placeholder="Car loan, Home loan, Credit card, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Loan Amount</Label>
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
            <Label htmlFor="dueDay">Payment Due Day</Label>
            <Input
              id="dueDay"
              type="number"
              placeholder="Day of month (1-31)"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
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
