'use client';

import { useTransition } from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { toggleAssignmentSubmitted, deleteAssignment } from './actions';

export type AssignmentRowData = {
  id: string;
  title: string;
  type: 'sgd' | 'coursework' | 'other';
  dueDate: Date;
  submitted: boolean;
  subject: { name: string; emoji: string } | null;
};

export function AssignmentRow({ assignment }: { assignment: AssignmentRowData }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <button
        onClick={() => startTransition(() => toggleAssignmentSubmitted(assignment.id))}
        disabled={isPending}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border',
            assignment.submitted && 'border-good bg-good text-white',
          )}
        >
          {assignment.submitted ? <Check className="h-3.5 w-3.5" /> : null}
        </span>
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', assignment.submitted && 'text-muted-foreground line-through')}>
            {assignment.subject ? `${assignment.subject.emoji} ` : ''}
            {assignment.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {format(assignment.dueDate, "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {assignment.type}
        </Badge>
      </button>
      <DeleteRowButton action={deleteAssignment.bind(null, assignment.id)} />
    </div>
  );
}
