'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createTimetableEntry } from './actions';

type Subject = { id: string; name: string; emoji: string };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TimetableForm({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await createTimetableEntry(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dayOfWeek">Day</Label>
        <Select id="dayOfWeek" name="dayOfWeek" defaultValue="1">
          {DAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startTime">Start time</Label>
        <Input id="startTime" name="startTime" type="time" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endTime">End time</Label>
        <Input id="endTime" name="endTime" type="time" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Type</Label>
        <Select id="label" name="label" defaultValue="Lecture">
          <option value="Lecture">Lecture</option>
          <option value="SGD">SGD</option>
          <option value="Lab">Lab</option>
          <option value="Quiz">Quiz</option>
          <option value="Other">Other</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
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
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit">Add to timetable</Button>
      </div>
    </form>
  );
}
