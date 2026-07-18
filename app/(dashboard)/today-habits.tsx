'use client';

import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleHabitLog } from './habits/actions';

export type TodayHabit = {
  id: string;
  name: string;
  color: string;
  doneToday: boolean;
};

export function TodayHabits({ habits, today }: { habits: TodayHabit[]; today: string }) {
  const [isPending, startTransition] = useTransition();

  if (habits.length === 0) {
    return <p className="text-sm text-muted-foreground">No habits set up yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {habits.map((h) => (
        <button
          key={h.id}
          disabled={isPending}
          onClick={() => startTransition(() => toggleHabitLog(h.id, today))}
          className={cn(
            'flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
            h.doneToday && 'border-transparent bg-primary/10',
          )}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
            {h.name}
          </span>
          {h.doneToday ? <Check className="h-4 w-4 text-primary" /> : null}
        </button>
      ))}
    </div>
  );
}
