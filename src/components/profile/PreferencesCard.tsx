
// src/components/profile/PreferencesTab.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import BudgetSetupForm from '@/components/budget/BudgetSetupForm';
import RemindersSection from './RemindersSection';
import { useState } from 'react';

export default function PreferencesTab() {
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [budgetPromptSchedule, setBudgetPromptSchedule] = useState(localStorage.getItem('budgetSetupSchedule') || 'never');

  const handleScheduleChange = (value: string) => {
    setBudgetPromptSchedule(value);
    localStorage.setItem('budgetSetupSchedule', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Budget Setup Reminder</Label>
          <Select value={budgetPromptSchedule} onValueChange={handleScheduleChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Sheet open={showBudgetSetup} onOpenChange={setShowBudgetSetup}>
          <SheetTrigger asChild>
            <Button>Set Budget Allocation</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Budget Setup</SheetTitle>
              <SheetDescription>Allocate income across categories</SheetDescription>
            </SheetHeader>
            <BudgetSetupForm onComplete={() => setShowBudgetSetup(false)} />
          </SheetContent>
        </Sheet>

        <RemindersSection />
      </CardContent>
    </Card>
  );
}