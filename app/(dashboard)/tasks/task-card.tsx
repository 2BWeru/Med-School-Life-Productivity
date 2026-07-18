'use client';

import { useTransition } from 'react';
import { format } from 'date-fns';
import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setTaskStatus, deleteTask } from './actions';

export type TaskCardData = {
  id: string;
  title: string;
  description: string | null;
  category: 'academic' | 'clinical' | 'personal' | 'health';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: Date | null;
  subject: { name: string; color: string } | null;
};

const CATEGORY_LABEL: Record<TaskCardData['category'], string> = {
  academic: 'Academic',
  clinical: 'Clinical',
  personal: 'Personal',
  health: 'Health',
};

const PRIORITY_VARIANT: Record<TaskCardData['priority'], 'outline' | 'warning' | 'destructive'> = {
  low: 'outline',
  medium: 'warning',
  high: 'destructive',
};

export function TaskCard({ task }: { task: TaskCardData }) {
  const [isPending, startTransition] = useTransition();

  const isOverdue =
    task.dueDate && task.status !== 'done' && task.dueDate.getTime() < Date.now();

  function moveStatus(direction: 'forward' | 'back') {
    const order: TaskCardData['status'][] = ['todo', 'in_progress', 'done'];
    const idx = order.indexOf(task.status);
    const nextIdx = direction === 'forward' ? idx + 1 : idx - 1;
    const next = order[nextIdx];
    if (!next) return;
    startTransition(() => {
      setTaskStatus(task.id, next);
    });
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <button
          onClick={() => startTransition(() => deleteTask(task.id))}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {task.description ? (
        <p className="text-xs text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{CATEGORY_LABEL[task.category]}</Badge>
        <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
        {task.subject ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: task.subject.color }}
            />
            {task.subject.name}
          </span>
        ) : null}
      </div>

      {task.dueDate ? (
        <p className={`text-xs ${isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
          Due {format(task.dueDate, 'MMM d, yyyy')}
          {isOverdue ? ' · overdue' : ''}
        </p>
      ) : null}

      <div className="mt-1 flex gap-2">
        {task.status !== 'todo' && (
          <Button size="sm" variant="outline" onClick={() => moveStatus('back')}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        )}
        {task.status !== 'done' && (
          <Button size="sm" variant="outline" onClick={() => moveStatus('forward')}>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
