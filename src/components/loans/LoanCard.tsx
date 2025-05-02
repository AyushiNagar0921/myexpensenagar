
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAppContext } from '@/contexts/AppContext';
import { Loan } from '@/contexts/LoanContext';
import { toast } from "sonner";

interface LoanCardProps {
  loan: Loan;
  onDelete: (id: string) => Promise<void>;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onDelete }) => {
  const { updateLoanPayment } = useAppContext();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(loan.monthlyPayment.toString());
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate paid percentage
  const paidAmount = loan.totalAmount - loan.remainingAmount;
  const paidPercentage = (paidAmount / loan.totalAmount) * 100;
  const isPaidOff = loan.remainingAmount <= 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate months remaining (rough estimate)
  const monthsRemaining = Math.ceil(loan.remainingAmount / loan.monthlyPayment);
  
  // Handle payment submission
  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateLoanPayment(loan.id, amount);
      setPaymentAmount(loan.monthlyPayment.toString());
      setIsPaymentOpen(false);
    } catch (error) {
      console.error('Error making loan payment:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(loan.id);
    } catch (error) {
      console.error('Error deleting loan:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="expense-card">
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{loan.title}</h3>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {isPaidOff ? 'Paid Off!' : `${Math.round(paidPercentage)}% paid`}
            </div>
          </div>
        </div>
        
        <Progress value={paidPercentage} className="h-2 mb-4" />
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Remaining:</span>{" "}
            <span className="font-medium">
              {isPaidOff ? 'Paid Off!' : formatCurrency(loan.remainingAmount)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{formatCurrency(loan.totalAmount)}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Monthly:</span>{" "}
            <span className="font-medium">{formatCurrency(loan.monthlyPayment)}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">
              {isPaidOff ? 'Completed:' : 'Due:'}
            </span>{" "}
            <span className="font-medium">
              {isPaidOff
                ? "Congratulations!"
                : format(loan.nextPaymentDate, "MMM d")}
            </span>
          </div>
          
          {!isPaidOff && (
            <div className="col-span-2 mt-1">
              <span className="text-muted-foreground">Est. Remaining:</span>{" "}
              <span className="font-medium">
                {monthsRemaining} {monthsRemaining === 1 ? 'month' : 'months'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex gap-2">
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1" disabled={isPaidOff || isLoading}>
              {isPaidOff ? 'Paid Off' : 'Make Payment'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4 py-2">
              <h3 className="text-lg font-semibold">Make Loan Payment</h3>
              <p className="text-sm text-muted-foreground">
                Make a payment towards your "{loan.title}" loan
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Regular payment: {formatCurrency(loan.monthlyPayment)}
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsPaymentOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1"
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Make Payment'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="ghost" 
          className="flex-1"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanCard;
