
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from '@/contexts/AppContext';
import { toast } from "sonner";

const GoalForm = ({ onClose }: { onClose: () => void }) => {
  const { addSavingGoal } = useAppContext();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a goal title');
      return;
    }
    
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    
    const target = parseFloat(targetAmount);
    const current = currentAmount ? parseFloat(currentAmount) : 0;
    
    if (current > target) {
      toast.error('Current amount cannot be greater than target amount');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the new saving goal
      await addSavingGoal({
        title,
        targetAmount: target,
        currentAmount: current,
        deadline
      });
      
      // Reset form and close modal
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline(undefined);
      onClose();
    } catch (error) {
      console.error('Failed to add saving goal:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Saving Goal</CardTitle>
        <CardDescription>Create a new goal to save towards</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="Vacation, New phone, Emergency fund, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentAmount">Current Progress (Optional)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="currentAmount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Target Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding Goal...' : 'Add Goal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalForm;
