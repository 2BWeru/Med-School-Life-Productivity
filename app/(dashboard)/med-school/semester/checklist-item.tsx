'use client';

import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleChecklistItem } from './actions';

export function ChecklistItem({ id, label, done }: { id: string; label: string; done: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleChecklistItem(id))}
      className="flex w-full items-center gap-2.5 text-left text-[13px] font-semibold disabled:opacity-60"
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-border',
          done && 'border-good bg-good text-white',
        )}
      >
        {done ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className={cn(done && 'text-muted-foreground line-through')}>{label}</span>
    </button>
  );
}
