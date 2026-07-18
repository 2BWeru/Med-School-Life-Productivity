import Link from 'next/link';
import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm';
import { format, subDays, differenceInCalendarDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { tasks, exams, studySessions, habits, habitLogs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { WeeklyChart } from './study/weekly-chart';
import { TodayHabits } from './today-habits';

export const dynamic = 'force-dynamic';

export default async function DashboardHomePage() {
  const user = await requireUser();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [allOpenTasks, upcomingExams, recentSessions, userHabits] = await Promise.all([
    db.query.tasks.findMany({
      where: and(eq(tasks.userId, user.userId), ne(tasks.status, 'done')),
      orderBy: [asc(tasks.dueDate)],
      with: { subject: true },
    }),
    db.query.exams.findMany({
      where: eq(exams.userId, user.userId),
      orderBy: [asc(exams.examDate)],
      with: { subject: true },
      limit: 3,
    }),
    db.query.studySessions.findMany({
      where: eq(studySessions.userId, user.userId),
      orderBy: [desc(studySessions.sessionDate)],
    }),
    db.query.habits.findMany({ where: eq(habits.userId, user.userId) }),
  ]);

  const openTasks = allOpenTasks.slice(0, 5);
  const openTasksCount = allOpenTasks.length;
  const futureExams = upcomingExams.filter((e) => e.examDate.getTime() >= Date.now());

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const minutes = recentSessions
      .filter((s) => s.sessionDate === date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return { date, minutes };
  });
  const weeklyHours = last7Days.reduce((sum, d) => sum + d.minutes, 0) / 60;

  const habitIds = userHabits.map((h) => h.id);
  const todayLogs = habitIds.length
    ? await db.query.habitLogs.findMany({
        where: and(inArray(habitLogs.habitId, habitIds), eq(habitLogs.logDate, today)),
      })
    : [];
  const doneHabitIds = new Set(todayLogs.map((l) => l.habitId));
  const todayHabits = userHabits.map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color,
    doneToday: doneHabitIds.has(h.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Open tasks</p>
            <p className="mt-1 text-2xl font-semibold">{openTasksCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Next exam</p>
            <p className="mt-1 text-2xl font-semibold">
              {futureExams[0]
                ? `${Math.max(0, differenceInCalendarDays(futureExams[0].examDate, new Date()))}d`
                : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Studied this week</p>
            <p className="mt-1 text-2xl font-semibold">{weeklyHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Habits today</p>
            <p className="mt-1 text-2xl font-semibold">
              {todayHabits.filter((h) => h.doneToday).length}/{todayHabits.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Today &amp; upcoming tasks</CardTitle>
              <CardDescription>Your open to-dos, soonest due date first.</CardDescription>
            </div>
            <Link href="/tasks" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing open — nice work.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {openTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      {t.subject ? (
                        <p className="truncate text-xs text-muted-foreground">{t.subject.name}</p>
                      ) : null}
                    </div>
                    {t.dueDate ? (
                      <Badge variant="outline" className="shrink-0">
                        {format(t.dueDate, 'MMM d')}
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming exams</CardTitle>
              <CardDescription>What&apos;s on the horizon.</CardDescription>
            </div>
            <Link href="/exams" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {futureExams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exams scheduled.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {futureExams.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {format(e.examDate, 'EEE, MMM d')}
                      </p>
                    </div>
                    <Badge variant={differenceInCalendarDays(e.examDate, new Date()) <= 3 ? 'destructive' : 'success'}>
                      {differenceInCalendarDays(e.examDate, new Date())}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study hours — last 7 days</CardTitle>
            <CardDescription>
              <Link href="/study" className="text-primary hover:underline">
                Log a session
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart days={last7Days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s habits</CardTitle>
              <CardDescription>Tap to mark complete.</CardDescription>
            </div>
            <Link href="/habits" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            <TodayHabits habits={todayHabits} today={today} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
