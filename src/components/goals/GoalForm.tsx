import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSavingGoalContext } from "@/contexts/SavingGoalContext";

interface GoalFormProps {
  onSave: () => void;
  editingGoal?: {
    id: string;
    title: string;
    target_amount: number;
    saved_amount: number;
    deadline: string;
  };
}

export default function GoalForm({ onSave, editingGoal }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const { addSavingGoal, updateSavingGoal } = useSavingGoalContext();

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(editingGoal.target_amount);
      setSavedAmount(editingGoal.saved_amount);
      setDeadline(editingGoal.deadline);
    }
  }, [editingGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (savedAmount >= targetAmount) {
      toast.error("The saved amount is already equal to or greater than the target.");
      return;
    }

    try {
      if (editingGoal) {
        await updateSavingGoal({
          id: editingGoal.id,
          title,
          targetAmount,
          currentAmount: savedAmount,
          deadline: new Date(deadline),
        });
      } else {
        await addSavingGoal({
          title,
          targetAmount,
          currentAmount: savedAmount,
          deadline: new Date(deadline),
        });
      }
      onSave();
      setTitle("");
      setTargetAmount(0);
      setSavedAmount(0);
      setDeadline("");
    } catch {
      // error already handled in context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Target Amount</Label>
        <Input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(parseFloat(e.target.value))}
          required
        />
      </div>
      <div>
        <Label>Saved Amount</Label>
        <Input
          type="number"
          value={savedAmount}
          onChange={(e) => setSavedAmount(parseFloat(e.target.value))}
          required
        />
      </div>
      <div>
        <Label>Deadline</Label>
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{editingGoal ? "Update Goal" : "Add Goal"}</Button>
    </form>
  );
}