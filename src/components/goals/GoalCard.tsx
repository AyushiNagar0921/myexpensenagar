
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { SavingGoal, useAppContext } from '@/contexts/AppContext';
import { toast } from "sonner";

interface GoalCardProps {
  goal: SavingGoal;
  onDelete: (id: string) => Promise<void>;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onDelete }) => {
  const { updateSavingGoalAmount } = useAppContext();
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isCompleted = progressPercentage >= 100;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate remaining amount
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  // Calculate days remaining until deadline
  const getDaysRemaining = () => {
    if (!goal.deadline) return null;
    
    const today = new Date();
    const diffTime = goal.deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  
  const daysRemaining = goal.deadline ? getDaysRemaining() : null;
  
  // Handle contribution submission
  const handleContribute = async () => {
    const amount = parseFloat(contributionAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateSavingGoalAmount(goal.id, amount);
      setContributionAmount('');
      setIsContributionOpen(false);
    } catch (error) {
      console.error('Error contributing to goal:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(goal.id);
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="expense-card">
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {isCompleted ? 'Completed!' : `${Math.round(progressPercentage)}% of goal`}
            </div>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2 mb-4" />
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Current:</span>{" "}
            <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Target:</span>{" "}
            <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Remaining:</span>{" "}
            <span className={`font-medium ${isCompleted ? 'text-green-500' : ''}`}>
              {isCompleted ? 'Done!' : formatCurrency(remainingAmount)}
            </span>
          </div>
          
          {goal.deadline && (
            <div>
              <span className="text-muted-foreground">Deadline:</span>{" "}
              <span className="font-medium">
                {daysRemaining === 0
                  ? "Today"
                  : daysRemaining === 1
                  ? "Tomorrow"
                  : `${daysRemaining} days (${format(goal.deadline, "MMM d")})`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex gap-2">
        <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1" disabled={isCompleted || isLoading}>
              {isCompleted ? 'Completed' : 'Add Funds'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4 py-2">
              <h3 className="text-lg font-semibold">Contribute to Goal</h3>
              <p className="text-sm text-muted-foreground">
                Add funds to your "{goal.title}" saving goal
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
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsContributionOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1"
                  onClick={handleContribute}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Funds'}
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

export default GoalCard;
