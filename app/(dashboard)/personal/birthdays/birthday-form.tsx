'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBirthday } from './actions';

export function BirthdayForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createBirthday(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Amara" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date (any year)</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-3">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" placeholder="Gift ideas, how you know them..." />
      </div>
      <div className="sm:col-span-3">
        <Button type="submit">Add birthday</Button>
      </div>
    </form>
  );
}
