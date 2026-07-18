'use client';

import { useTransition } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deleteExam } from './actions';

export type ExamCardData = {
  id: string;
  title: string;
  examType: 'exam' | 'quiz' | 'osce' | 'practical' | 'rotation_end';
  examDate: Date;
  notes: string | null;
  subject: { name: string; color: string } | null;
};

const TYPE_LABEL: Record<ExamCardData['examType'], string> = {
  exam: 'Exam',
  quiz: 'Quiz',
  osce: 'OSCE',
  practical: 'Practical',
  rotation_end: 'Rotation End',
};

export function ExamCard({ exam }: { exam: ExamCardData }) {
  const [isPending, startTransition] = useTransition();
  const daysLeft = differenceInCalendarDays(exam.examDate, new Date());
  const isPast = daysLeft < 0;

  let countdownLabel: string;
  if (isPast) countdownLabel = 'Past';
  else if (daysLeft === 0) countdownLabel = 'Today';
  else if (daysLeft === 1) countdownLabel = 'Tomorrow';
  else countdownLabel = `${daysLeft} days`;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{exam.title}</p>
          <Badge variant="outline">{TYPE_LABEL[exam.examType]}</Badge>
          {exam.subject ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: exam.subject.color }}
              />
              {exam.subject.name}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {format(exam.examDate, "EEE, MMM d, yyyy 'at' h:mm a")}
        </p>
        {exam.notes ? <p className="mt-1 text-xs text-muted-foreground">{exam.notes}</p> : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <Badge variant={isPast ? 'secondary' : daysLeft <= 3 ? 'destructive' : 'success'}>
          {countdownLabel}
        </Badge>
        <button
          onClick={() => startTransition(() => deleteExam(exam.id))}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete exam"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
