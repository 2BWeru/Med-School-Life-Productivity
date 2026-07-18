'use client';

import { useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { deleteStudySession } from './actions';

export type SessionRow = {
  id: string;
  durationMinutes: number;
  sessionDate: string;
  notes: string | null;
  subject: { name: string; color: string } | null;
};

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No study sessions logged yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.subject?.color ?? '#94a3b8' }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {s.subject?.name ?? 'General'} · {Math.round(s.durationMinutes)} min
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {format(parseISO(s.sessionDate), 'EEE, MMM d')}
                {s.notes ? ` — ${s.notes}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => startTransition(() => deleteStudySession(s.id))}
            disabled={isPending}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Delete session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
