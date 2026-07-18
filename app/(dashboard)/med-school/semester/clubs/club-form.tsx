'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClub } from './actions';

export function ClubForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createClub(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">Club / society</Label>
        <Input id="name" name="name" placeholder="e.g. IFMSA" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Role (optional)</Label>
        <Input id="role" name="role" placeholder="Member, Committee..." />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="joinedDate">Joined (optional)</Label>
        <Input id="joinedDate" name="joinedDate" type="date" />
      </div>
      <div className="sm:col-span-3">
        <Button type="submit">Add club</Button>
      </div>
    </form>
  );
}
