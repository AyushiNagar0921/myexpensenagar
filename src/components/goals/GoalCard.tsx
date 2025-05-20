// components/goals/GoalCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useAppContext, SavingGoal } from '@/contexts/AppContext';

export interface GoalCardProps {
  goal: SavingGoal,
  onEdit: (goal: GoalCardProps["goal"]) => void;
  // onAddFunds: (goal: GoalCardProps["goal"]) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => { // Removed onAddFunds prop
  const [isAddingFundsOpen, setIsAddingFunds] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateSavingGoalAmount } = useAppContext();

  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isCompleted = progressPercentage >= 100;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);

    const handleAddFundsSubmit = async () => { // Make it an async function
      const amountToAdd = parseFloat(addFundsAmount);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      setIsLoading(true);
      try {
        await updateSavingGoalAmount(goal.id, amountToAdd, goal.title); // Call the context function directly
        setAddFundsAmount('');
        setIsAddingFunds(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to add funds');
      } finally {
        setIsLoading(false);
      }
    };
  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <div className="text-right text-sm text-muted-foreground">
            {isCompleted ? <CheckCircle2 className="text-green-500 animate-pulse" /> : `${Math.round(progressPercentage)}% saved`}
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-4" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Saved:</span>{" "}
            <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Target:</span>{" "}
            <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
          </div>
          {goal.deadline && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Deadline:</span>{" "}
              <span className="font-medium">{goal.deadline.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex flex-wrap gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onEdit(goal)}>
          Edit
        </Button>

        <Dialog open={isAddingFundsOpen} onOpenChange={setIsAddingFunds}>
          <DialogTrigger asChild>
            <Button className="flex-1" disabled={isCompleted}>
              Add Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4 py-2">
              <h3 className="text-lg font-semibold">Add Funds</h3>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddingFunds(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddFundsSubmit} disabled={isLoading}>
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" className="flex-1" onClick={() => onDelete(goal.id)} disabled={isLoading}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;