import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CircleUserRound, Plus } from "lucide-react";
import { useAppContext } from '@/contexts/AppContext';
import GoalForm from '@/components/goals/GoalForm';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import GoalCard, { GoalCardProps } from '@/components/goals/GoalCard'; // Import GoalCardProps

const SavingGoals = () => {
  const { savingGoals, deleteSavingGoal, isLoading, ensureProfileExists, updateSavingGoalAmount, updateSavingGoal } = useAppContext();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingGoalData, setEditingGoalData] = useState<GoalCardProps["goal"] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      await ensureProfileExists();
    };
    checkProfile();
  }, [ensureProfileExists]);

const handleEdit = useCallback((goalToEdit: GoalCardProps["goal"]) => {
  setEditingGoalData({
    id: goalToEdit.id,
    title: goalToEdit.title,
    targetAmount: goalToEdit.targetAmount,
    currentAmount: goalToEdit.currentAmount,
    deadline: goalToEdit.deadline,
  });
  setIsEditingGoal(true);
}, []);

  // const handleAddFunds = (goalToAddFunds: GoalCardProps["goal"]) => {
  //   const amountToAdd = prompt(`Enter the amount to add to "${goalToAddFunds.title}":`); // This is likely the source of the extra popup
  //   if (amountToAdd && !isNaN(Number(amountToAdd))) {
  //     updateSavingGoalAmount(goalToAddFunds.id, parseFloat(amountToAdd));
  //   } else if (amountToAdd !== null) {
  //     alert("Invalid amount entered.");
  //   }
  // };

  const handleSaveEdit = () => {
    setIsEditingGoal(false);
    setEditingGoalData(null);
    // The GoalForm's onSave prop will handle the actual update via the context
  };

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
        <div className="flex items-center gap-2">
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <GoalForm onSave={() => setIsAddingGoal(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
            <DialogTrigger asChild>
              {/* This trigger might not be directly used here, 
                  as the edit button on the GoalCard will open the dialog */}
            </DialogTrigger>
            <DialogContent>
              {editingGoalData && (
                <GoalForm
                  onSave={handleSaveEdit}
                  editingGoal={{
                    id: editingGoalData.id,
                    title: editingGoalData.title,
                    target_amount: editingGoalData.targetAmount,
                    saved_amount: editingGoalData.currentAmount,
                    deadline: editingGoalData.deadline?.toISOString().split('T')[0] || "",
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="h-12 w-12"
          >
            <CircleUserRound className="scale-[1.8] text-primary" />
          </Button>
        </div>
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
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={deleteSavingGoal}
              onEdit={handleEdit}
              // onAddFunds={handleAddFunds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavingGoals;