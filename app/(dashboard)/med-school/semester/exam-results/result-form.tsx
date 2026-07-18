'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createExamResult } from './actions';

type Subject = { id: string; name: string; emoji: string };

export function ResultForm({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function handleAction(formData: FormData) {
    await createExamResult(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <Label htmlFor="title">Exam name</Label>
        <Input id="title" name="title" placeholder="e.g. Physiology final" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subjectId">Subject</Label>
        <Select id="subjectId" name="subjectId" defaultValue="">
          <option value="">None</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resultDate">Date</Label>
        <Input id="resultDate" name="resultDate" type="date" defaultValue={today} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="score">Score</Label>
        <Input id="score" name="score" type="number" placeholder="82" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxScore">Out of</Label>
        <Input id="maxScore" name="maxScore" type="number" placeholder="100" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit">Save result</Button>
      </div>
    </form>
  );
}
