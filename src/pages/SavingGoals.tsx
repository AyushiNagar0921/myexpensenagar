
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAppContext } from '@/contexts/AppContext';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import { Skeleton } from "@/components/ui/skeleton";

const SavingGoals = () => {
  const { savingGoals, deleteSavingGoal, isLoading, ensureProfileExists } = useAppContext();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      await ensureProfileExists();
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Saving Goals</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Saving Goals</h2>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <GoalForm onClose={() => setIsAddingGoal(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {savingGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <div className="rounded-full bg-primary/20 p-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No saving goals yet</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Create your first saving goal to start tracking your progress towards your dreams.
          </p>
          <Button onClick={() => setIsAddingGoal(true)}>Add Your First Goal</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savingGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={deleteSavingGoal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavingGoals;
