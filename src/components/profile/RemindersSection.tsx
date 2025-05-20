
// src/components/profile/RemindersSection.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function RemindersSection() {
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');

  const addTime = () => {
    if (!newTime) return;
    setTimes([...times, newTime]);
    setNewTime('');
  };

  const saveReminders = async () => {
    try {
      // Save to Supabase (replace with actual logic)
      console.log('Saving reminder times:', times);
      toast.success('Reminder times saved');
    } catch {
      toast.error('Failed to save reminders');
    }
  };

  return (
    <div className="space-y-3">
      <Label>Daily Expense Reminders</Label>
      <p className="text-sm text-muted-foreground">Set times during the day to get reminders to log your expenses.</p>
      <div className="flex gap-2">
        <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
        <Button onClick={addTime}>Add</Button>
      </div>
      <ul className="text-sm text-muted-foreground">
        {times.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
      <Button onClick={saveReminders}>Save Reminders</Button>
    </div>
  );
}
