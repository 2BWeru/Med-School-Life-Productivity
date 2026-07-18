'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addVisaDocument } from './actions';

export function AddDocForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await addVisaDocument(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="docName">Document</Label>
        <Input id="docName" name="name" placeholder="e.g. Passport copy" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="docDueDate">Due date (optional)</Label>
        <Input id="docDueDate" name="dueDate" type="date" />
      </div>
      <Button type="submit" variant="outline">
        Add document
      </Button>
    </form>
  );
}
