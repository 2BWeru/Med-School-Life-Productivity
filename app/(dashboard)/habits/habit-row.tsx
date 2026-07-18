'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleHabitLog, deleteHabit } from './actions';

export type HabitRowData = {
  id: string;
  name: string;
  color: string;
  loggedDates: string[];
};

export function HabitRow({ habit, days }: { habit: HabitRowData; days: string[] }) {
  const [isPending, startTransition] = useTransition();
  const loggedSet = new Set(habit.loggedDates);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
        <p className="text-sm font-medium">{habit.name}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {days.map((day) => {
            const done = loggedSet.has(day);
            return (
              <button
                key={day}
                disabled={isPending}
                onClick={() => startTransition(() => toggleHabitLog(habit.id, day))}
                title={format(parseISO(day), 'EEE, MMM d')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-accent',
                  done && 'border-transparent text-white hover:opacity-90',
                )}
                style={done ? { backgroundColor: habit.color } : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : format(parseISO(day), 'EEEEE')}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => startTransition(() => deleteHabit(habit.id))}
          disabled={isPending}
          className="ml-1 text-muted-foreground hover:text-destructive"
          aria-label="Delete habit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
