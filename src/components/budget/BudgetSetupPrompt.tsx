
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BudgetSetupForm from './BudgetSetupForm';
import { useAppContext } from '@/contexts/AppContext';

interface BudgetSetupPromptProps {
  onComplete: () => void;
}

const BudgetSetupPrompt: React.FC<BudgetSetupPromptProps> = ({ onComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<string>('never');

  const handleComplete = () => {
    // Save user preference for budget setup prompt
    localStorage.setItem('budgetSetupSchedule', scheduleTime);
    
    if (showBudgetSetup) {
      setIsSheetOpen(true);
    } else {
      onComplete();
    }
  };

  const handleBudgetSetupComplete = () => {
    setIsSheetOpen(false);
    onComplete();
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Budget Setup</CardTitle>
          <CardDescription>Would you like to set up your budget now?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="setup-budget">Set up budget now</Label>
            <Switch 
              id="setup-budget" 
              checked={showBudgetSetup}
              onCheckedChange={setShowBudgetSetup}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminder">Show budget setup reminder</Label>
            <Select
              value={scheduleTime}
              onValueChange={setScheduleTime}
            >
              <SelectTrigger id="reminder" className="w-full">
                <SelectValue placeholder="Select when to remind you" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleComplete}>
            Continue
          </Button>
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle>Budget Setup</SheetTitle>
            <SheetDescription>
              Allocate your income across different spending categories
            </SheetDescription>
          </SheetHeader>
          <BudgetSetupForm onComplete={handleBudgetSetupComplete} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BudgetSetupPrompt;
