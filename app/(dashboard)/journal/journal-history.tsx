'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { deleteJournalEntry } from './actions';

const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export type JournalEntryRow = {
  id: string;
  entryDate: string;
  mood: number;
  content: string | null;
};

export function JournalHistory({ entries }: { entries: JournalEntryRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No past entries yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start justify-between gap-3 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="text-xl">{MOOD_EMOJI[entry.mood] ?? '😐'}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {format(parseISO(entry.entryDate), 'EEEE, MMM d, yyyy')}
              </p>
              {entry.content ? (
                <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                  {entry.content}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => startTransition(() => deleteJournalEntry(entry.id))}
            disabled={isPending}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
