'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logGymSession } from './actions';

export function GymForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function handleAction(formData: FormData) {
    await logGymSession(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <Label htmlFor="workoutType">Workout</Label>
        <Input id="workoutType" name="workoutType" placeholder="e.g. Leg day" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logDate">Date</Label>
        <Input id="logDate" name="logDate" type="date" defaultValue={today} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="durationMinutes">Minutes</Label>
        <Input id="durationMinutes" name="durationMinutes" type="number" placeholder="45" />
      </div>
      <div className="flex flex-col gap-1.5 lg:col-span-4">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" placeholder="How did it feel?" />
      </div>
      <div className="lg:col-span-4">
        <Button type="submit">Log session</Button>
      </div>
    </form>
  );
}
