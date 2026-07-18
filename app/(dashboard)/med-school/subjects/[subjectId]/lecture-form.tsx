'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createLecture } from './actions';

export function LectureForm({ subjectId }: { subjectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundCreate = createLecture.bind(null, subjectId);

  async function handleAction(formData: FormData) {
    await boundCreate(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="title">Lecture title</Label>
        <Input id="title" name="title" placeholder="e.g. Heart Failure — Lecture 14" required />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="whyItMatters">Why this matters</Label>
        <Textarea
          id="whyItMatters"
          name="whyItMatters"
          placeholder="Why does this topic matter? What's the clinical 'so what'?"
          rows={2}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="roadmapConnections">How this connects</Label>
        <Input
          id="roadmapConnections"
          name="roadmapConnections"
          placeholder="e.g. Cardiac Cycle → Frank-Starling Law → this topic"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lectureUrl">Lecture video link</Label>
        <Input id="lectureUrl" name="lectureUrl" placeholder="https://..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="questionsUrl">Practice questions link</Label>
        <Input id="questionsUrl" name="questionsUrl" placeholder="https://..." />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notebookLmPrompt">NotebookLM prompt (optional)</Label>
        <Textarea
          id="notebookLmPrompt"
          name="notebookLmPrompt"
          placeholder="Paste a prompt to use in NotebookLM for this lecture"
          rows={2}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" rows={3} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="mnemonics">Mnemonics</Label>
        <Textarea id="mnemonics" name="mnemonics" rows={2} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save today&apos;s lecture</Button>
      </div>
    </form>
  );
}
