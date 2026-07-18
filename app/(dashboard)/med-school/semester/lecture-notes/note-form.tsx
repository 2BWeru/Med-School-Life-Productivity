'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createLectureNote } from './actions';

type Subject = { id: string; name: string; emoji: string };

export function NoteForm({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createLectureNote(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Heart Failure — Lecture 14" required />
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
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="content">Notes</Label>
        <Textarea id="content" name="content" placeholder="Paste or type your notes..." rows={4} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save note</Button>
      </div>
    </form>
  );
}
