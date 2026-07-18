'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createExam } from './actions';

type Subject = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add to calendar'}
    </Button>
  );
}

export function AddExamForm({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createExam(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Cardiology midterm" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="examType">Type</Label>
        <Select id="examType" name="examType" defaultValue="exam">
          <option value="exam">Exam</option>
          <option value="quiz">Quiz</option>
          <option value="cat">CAT</option>
          <option value="main_exam">Main exam</option>
          <option value="osce">OSCE</option>
          <option value="practical">Practical</option>
          <option value="rotation_end">Rotation end</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subjectId">Subject (optional)</Label>
        <Select id="subjectId" name="subjectId" defaultValue="">
          <option value="">None</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="examDate">Date &amp; time</Label>
        <Input id="examDate" name="examDate" type="datetime-local" required />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Topics, location, format..." />
      </div>

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
