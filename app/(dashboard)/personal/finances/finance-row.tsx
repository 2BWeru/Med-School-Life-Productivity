'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { markFinanceEntryPaid, deleteFinanceEntry } from './actions';

export type FinanceRowData = {
  id: string;
  category: 'rent' | 'utilities' | 'other';
  label: string;
  amount: string;
  dueDate: string | null;
  paid: boolean;
};

export function FinanceRow({ entry }: { entry: FinanceRowData }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <button
        onClick={() => startTransition(() => markFinanceEntryPaid(entry.id))}
        disabled={isPending}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border',
            entry.paid && 'border-good bg-good text-white',
          )}
        >
          {entry.paid ? <Check className="h-3.5 w-3.5" /> : null}
        </span>
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', entry.paid && 'text-muted-foreground line-through')}>
            {entry.label}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.dueDate ? `Due ${format(parseISO(entry.dueDate), 'MMM d')}` : 'No due date'}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {entry.category}
        </Badge>
      </button>
      <span className="shrink-0 text-sm font-extrabold tabular-nums">${Number(entry.amount).toFixed(2)}</span>
      <DeleteRowButton action={deleteFinanceEntry.bind(null, entry.id)} />
    </div>
  );
}
