'use client';

import { useRef, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSubject, deleteSubject } from './actions';

type Subject = { id: string; name: string; color: string };

export function SubjectManager({ subjects }: { subjects: Subject[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {
    await createSubject(formData);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-2.5 pr-1.5 text-xs font-medium"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
            <button
              onClick={() => startTransition(() => deleteSubject(s.id))}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive"
              aria-label={`Remove ${s.name}`}
              disabled={isPending}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {subjects.length === 0 ? (
          <p className="text-xs text-muted-foreground">No subjects yet — add one below.</p>
        ) : null}
      </div>

      <form ref={formRef} action={handleAction} className="flex gap-2">
        <Input name="name" placeholder="e.g. Neurology" className="max-w-xs" />
        <Button type="submit" size="sm" variant="outline">
          Add subject
        </Button>
      </form>
    </div>
  );
}
