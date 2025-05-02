
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { CalendarIcon } from 'lucide-react';

const ActiveLoans = () => {
  const { loans } = useAppContext();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Get days until next payment
  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Active Loans</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loans.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No active loans</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.slice(0, 3).map((loan) => {
              const daysUntil = getDaysUntil(loan.nextPaymentDate);
              const isOverdue = daysUntil < 0;
              
              return (
                <div key={loan.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <h4 className="font-medium">{loan.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {isOverdue ? 'Overdue' : `Due in ${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                    <p className="text-xs text-muted-foreground">
                      of {formatCurrency(loan.remainingAmount)} left
                    </p>
                  </div>
                </div>
              );
            })}
            
            {loans.length > 3 && (
              <div className="text-center pt-2">
                <a href="/loans" className="text-sm text-primary hover:underline">
                  View all ({loans.length})
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveLoans;
