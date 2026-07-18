import { desc, eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { db } from '@/lib/db';
import { subjects, tasks } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { AddTaskForm } from './add-task-form';
import { TaskCard, type TaskCardData } from './task-card';

export const dynamic = 'force-dynamic';

const COLUMNS: { status: TaskCardData['status']; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export default async function TasksPage() {
  const user = await requireUser();

  const [userTasks, userSubjects] = await Promise.all([
    db.query.tasks.findMany({
      where: eq(tasks.userId, user.userId),
      orderBy: [desc(tasks.createdAt)],
      with: { subject: true },
    }),
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        description="Academics, clinical rotations, personal errands, and health — all in one place."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a task</CardTitle>
          <CardDescription>Quickly capture something you need to get done.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddTaskForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = userTasks.filter((t) => t.status === column.status);
          return (
            <div key={column.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">{column.label}</h2>
                <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {columnTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nothing here
                  </p>
                ) : (
                  columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
