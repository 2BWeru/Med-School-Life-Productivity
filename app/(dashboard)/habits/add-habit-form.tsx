'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createHabit } from './actions';

export function AddHabitForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createHabit(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="flex gap-2">
      <Input name="name" placeholder="e.g. Meditated 10 minutes" className="max-w-sm" required />
      <Button type="submit" variant="outline">
        Add habit
      </Button>
    </form>
  );
}
