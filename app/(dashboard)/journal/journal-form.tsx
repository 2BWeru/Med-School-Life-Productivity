'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveJournalEntry } from './actions';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save entry'}
    </Button>
  );
}

export function JournalForm({
  entryDate,
  initialMood,
  initialContent,
}: {
  entryDate: string;
  initialMood: number;
  initialContent: string;
}) {
  const [mood, setMood] = useState(initialMood);

  return (
    <form action={saveJournalEntry} className="flex flex-col gap-4">
      <input type="hidden" name="entryDate" value={entryDate} />
      <input type="hidden" name="mood" value={mood} />

      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(m.value)}
            title={m.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-colors ${
              mood === m.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
            }`}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <Textarea
        name="content"
        placeholder="How did today go? Anything worth remembering..."
        defaultValue={initialContent}
        rows={4}
      />

      <SubmitButton />
    </form>
  );
}
