'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { cycleApplicationStatus, deleteApplication } from './actions';

export type ApplicationRowData = {
  id: string;
  name: string;
  type: string;
  status: 'planned' | 'applied' | 'accepted' | 'rejected';
  deadline: string | null;
  notes: string | null;
};

const STATUS_VARIANT = {
  planned: 'outline',
  applied: 'warning',
  accepted: 'success',
  rejected: 'destructive',
} as const;

export function ApplicationRow({ application }: { application: ApplicationRowData }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{application.name}</p>
          <button
            onClick={() => startTransition(() => cycleApplicationStatus(application.id))}
            disabled={isPending}
          >
            <Badge variant={STATUS_VARIANT[application.status]}>{application.status}</Badge>
          </button>
          <Badge variant="outline">{application.type}</Badge>
        </div>
        {application.deadline ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Deadline: {format(parseISO(application.deadline), 'MMM d, yyyy')}
          </p>
        ) : null}
        {application.notes ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{application.notes}</p>
        ) : null}
      </div>
      <DeleteRowButton action={deleteApplication.bind(null, application.id)} />
    </div>
  );
}
