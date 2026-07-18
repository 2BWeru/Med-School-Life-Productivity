'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { cycleVisaDocumentStatus, deleteVisaDocument } from './actions';

export type VisaDocRow = {
  id: string;
  name: string;
  status: 'pending' | 'ready' | 'submitted';
  dueDate: string | null;
};

const STATUS_VARIANT = {
  pending: 'outline',
  ready: 'warning',
  submitted: 'success',
} as const;

export function DocumentRow({ doc }: { doc: VisaDocRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{doc.name}</p>
        {doc.dueDate ? (
          <p className="truncate text-xs text-muted-foreground">
            Due {format(parseISO(doc.dueDate), 'MMM d, yyyy')}
          </p>
        ) : null}
      </div>
      <button
        onClick={() => startTransition(() => cycleVisaDocumentStatus(doc.id))}
        disabled={isPending}
        className="shrink-0"
      >
        <Badge variant={STATUS_VARIANT[doc.status]}>{doc.status}</Badge>
      </button>
      <DeleteRowButton action={deleteVisaDocument.bind(null, doc.id)} />
    </div>
  );
}
