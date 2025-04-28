
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from '@/contexts/AppContext';

const SavingsGoalCard = () => {
  const { savingGoals } = useAppContext();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate days remaining for goal
  const getDaysRemaining = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Savings Goals</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {savingGoals.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No savings goals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savingGoals.map((goal) => {
              const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
              
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{goal.title}</h4>
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground text-right">
                      {getDaysRemaining(goal.deadline)} days remaining
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsGoalCard;
