'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createApplication } from './actions';

export function ApplicationForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createApplication(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. IFMSA SCORE Research Exchange" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <Select id="type" name="type" defaultValue="exchange">
          <option value="exchange">Exchange</option>
          <option value="scholarship">Scholarship</option>
          <option value="conference">Conference</option>
          <option value="internship">Internship</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue="planned">
          <option value="planned">Planned</option>
          <option value="applied">Applied</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Requirements, links, contacts..." />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Add application</Button>
      </div>
    </form>
  );
}
