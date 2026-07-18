'use client';

import { useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTopic, generateTodayTopic } from './actions';

export function TopicForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {
    await createTopic(formData);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => generateTodayTopic())}
      >
        🎲 {isPending ? 'Generating...' : 'Generate a topic for me'}
      </Button>
      <form ref={formRef} action={handleAction} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="topic">Or add your own</Label>
          <Input id="topic" name="topic" placeholder="Type a topic to practice" required />
        </div>
        <Button type="submit" variant="outline">
          Add
        </Button>
      </form>
    </div>
  );
}
