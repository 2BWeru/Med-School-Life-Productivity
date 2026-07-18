'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createFinanceEntry } from './actions';

export function FinanceForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createFinanceEntry(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue="rent">
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="e.g. July rent" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" placeholder="250.00" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Due date</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit">Add entry</Button>
      </div>
    </form>
  );
}
