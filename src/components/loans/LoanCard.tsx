import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAppContext, Loan } from '@/contexts/AppContext';
import { toast } from "sonner";

interface LoanCardProps {
  loan: Loan;
  onDelete: (id: string) => Promise<void>;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onDelete }) => {
  const { updateLoanPayment } = useAppContext();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate progress percentage
  const progressPercentage = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
  const isCompleted = progressPercentage >= 100;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate remaining amount
  const remainingAmount = loan.remainingAmount;

  // Calculate days remaining until next payment
  const getDaysRemaining = () => {
    const today = new Date();
    const diffTime = loan.nextPaymentDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();

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
      setPaymentAmount('');
      setIsPaymentOpen(false);
    } catch (error) {
      console.error('Error making payment:', error);
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
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{loan.title}</h3>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {isCompleted ? 'Paid Off!' : `${Math.round(progressPercentage)}% paid`}
            </div>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-4" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Outstanding:</span>{" "}
            <span className="font-medium">{formatCurrency(remainingAmount)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Amount:</span>{" "}
            <span className="font-medium">{formatCurrency(loan.totalAmount)}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Monthly Payment:</span>{" "}
            <span className="font-medium">{formatCurrency(loan.monthlyPayment)}</span>
          </div>

          <div>
            <span className="text-muted-foreground">Next Payment:</span>{" "}
            <span className="font-medium">
              {daysRemaining === 0
                ? "Today"
                : daysRemaining === 1
                  ? "Tomorrow"
                  : `${daysRemaining} days (${format(loan.nextPaymentDate, "MMM d")})`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex gap-2">
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1" disabled={isCompleted || isLoading}>
              {isCompleted ? 'Paid Off' : 'Make Payment'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4 py-2">
              <h3 className="text-lg font-semibold">Make a Payment</h3>
              <p className="text-sm text-muted-foreground">
                Enter the payment amount for your "{loan.title}" loan
              </p>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
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
                  {isLoading ? 'Paying...' : 'Pay Now'}
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
