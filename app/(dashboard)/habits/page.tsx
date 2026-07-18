import { eq, inArray } from 'drizzle-orm';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { db } from '@/lib/db';
import { habits, habitLogs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { AddHabitForm } from './add-habit-form';
import { HabitRow } from './habit-row';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const user = await requireUser();

  const userHabits = await db.query.habits.findMany({ where: eq(habits.userId, user.userId) });

  const days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

  const habitIds = userHabits.map((h) => h.id);
  const logs = habitIds.length
    ? await db.query.habitLogs.findMany({ where: inArray(habitLogs.habitId, habitIds) })
    : [];

  const habitsWithLogs = userHabits.map((h) => ({
    ...h,
    loggedDates: logs.filter((l) => l.habitId === h.id).map((l) => l.logDate),
  }));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const doneToday = habitsWithLogs.filter((h) => h.loggedDates.includes(todayStr)).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Habits"
        description={
          userHabits.length > 0
            ? `${doneToday} of ${userHabits.length} habits done today`
            : 'Build consistency across sleep, movement, and study.'
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a habit</CardTitle>
          <CardDescription>Track something small and repeatable, daily.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddHabitForm />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {habitsWithLogs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No habits yet — add your first one above.
          </p>
        ) : (
          habitsWithLogs.map((habit) => <HabitRow key={habit.id} habit={habit} days={days} />)
        )}
      </div>
    </div>
  );
}
