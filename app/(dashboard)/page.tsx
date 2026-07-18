import Link from 'next/link';
import { and, desc, eq, gte } from 'drizzle-orm';
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { db } from '@/lib/db';
import {
  studySessions,
  mealPlans,
  gymLogs,
  birthdays,
  financeEntries,
  speakingTopics,
} from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getMedSchoolGlance } from '@/lib/med-school-glance';
import { WeeklyChart } from './study/weekly-chart';

export const dynamic = 'force-dynamic';

function daysUntilNextBirthday(month: number, day: number, from: Date) {
  const year = from.getFullYear();
  let next = new Date(year, month - 1, day);
  if (next < from) next = new Date(year + 1, month - 1, day);
  return Math.round((next.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardHomePage() {
  const user = await requireUser();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  const { nextExam, nextCat, nextSgd, todaysClasses } = await getMedSchoolGlance(user.userId);

  const [
    recentSessions,
    todayMealPlan,
    lastGymLog,
    allBirthdays,
    unpaidFinances,
    todaySpeakingTopic,
  ] = await Promise.all([
    db.query.studySessions.findMany({
      where: eq(studySessions.userId, user.userId),
      orderBy: [desc(studySessions.sessionDate)],
    }),
    db.query.mealPlans.findFirst({
      where: and(eq(mealPlans.userId, user.userId), eq(mealPlans.planDate, today)),
    }),
    db.query.gymLogs.findFirst({
      where: eq(gymLogs.userId, user.userId),
      orderBy: [desc(gymLogs.logDate)],
    }),
    db.query.birthdays.findMany({ where: eq(birthdays.userId, user.userId) }),
    db.query.financeEntries.findMany({
      where: and(eq(financeEntries.userId, user.userId), eq(financeEntries.paid, false)),
    }),
    db.query.speakingTopics.findFirst({
      where: and(eq(speakingTopics.userId, user.userId), eq(speakingTopics.topicDate, today)),
    }),
  ]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(now, 6 - i), 'yyyy-MM-dd');
    const minutes = recentSessions
      .filter((s) => s.sessionDate === date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return { date, minutes };
  });
  const weeklyHours = last7Days.reduce((sum, d) => sum + d.minutes, 0) / 60;

  const upcomingBirthday = allBirthdays
    .map((b) => ({ ...b, daysUntil: daysUntilNextBirthday(b.month, b.day, now) }))
    .filter((b) => b.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];

  const nextUnpaidFinance = unpaidFinances
    .filter((f) => f.dueDate && differenceInCalendarDays(parseISO(f.dueDate), now) <= 7)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))[0];

  const isGymToday = lastGymLog?.logDate === today;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-extrabold sm:text-2xl">
          Hiii {user.name.split(' ')[0]}! 🎀
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{format(now, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-maroon" /> Med School
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground">Classes today</p>
              <p className="mt-1 text-2xl font-extrabold">{todaysClasses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground">Next exam</p>
              <p className="mt-1 text-2xl font-extrabold">
                {nextExam ? `${Math.max(0, differenceInCalendarDays(nextExam.examDate, now))}d` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground">Next CAT</p>
              <p className="mt-1 text-2xl font-extrabold">
                {nextCat ? `${Math.max(0, differenceInCalendarDays(nextCat.examDate, now))}d` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground">SGD due</p>
              <p className="mt-1 text-2xl font-extrabold">
                {nextSgd ? `${Math.max(0, differenceInCalendarDays(nextSgd.dueDate, now))}d` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Today&apos;s Lectures</CardTitle>
              <Link href="/med-school" className="text-xs font-extrabold text-primary">
                Open →
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Full glance, subjects, and today&apos;s lecture detail live on the Med School
                page.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Study hours — last 7 days</CardTitle>
              <CardDescription>
                {weeklyHours.toFixed(1)}h this week ·{' '}
                <Link href="/study" className="text-primary hover:underline">
                  Log a session
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyChart days={last7Days} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Personal Life
          <span className="font-normal normal-case tracking-normal text-muted-foreground/80">
            — just the essentials
          </span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <QuietPill emoji="🍲" href="/personal/meals">
            {todayMealPlan
              ? `Breakfast: ${todayMealPlan.breakfast ?? '—'} · Lunch: ${todayMealPlan.lunch ?? '—'} · Snack: ${todayMealPlan.snack ?? '—'}`
              : "Today's meals aren't set yet"}
          </QuietPill>
          <QuietPill emoji="💪" href="/personal/gym">
            {isGymToday
              ? `Logged today: ${lastGymLog?.workoutType}`
              : lastGymLog
                ? `Last session: ${lastGymLog.workoutType}`
                : 'No gym sessions logged yet'}
          </QuietPill>
          {upcomingBirthday ? (
            <QuietPill emoji="🎂" href="/personal/birthdays">
              {upcomingBirthday.daysUntil === 0
                ? `Today is ${upcomingBirthday.name}'s birthday 🎉`
                : `In ${upcomingBirthday.daysUntil}d: ${upcomingBirthday.name}'s birthday`}
            </QuietPill>
          ) : null}
          {nextUnpaidFinance ? (
            <QuietPill emoji="🏠" href="/personal/finances">
              {nextUnpaidFinance.label} due{' '}
              {nextUnpaidFinance.dueDate ? format(parseISO(nextUnpaidFinance.dueDate), 'MMM d') : ''}
            </QuietPill>
          ) : null}
          <QuietPill emoji="🎤" href="/personal/speaking">
            {todaySpeakingTopic ? todaySpeakingTopic.topic : 'No speaking topic yet today'}
          </QuietPill>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-plum" /> Work
        </h2>
        <Link
          href="/work"
          className="rounded-2xl border border-dashed border-border bg-card px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card-tint"
        >
          💼 No active client yet — tap to check in on your Work space.
        </Link>
      </section>
    </div>
  );
}

function QuietPill({
  emoji,
  href,
  children,
}: {
  emoji: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 basis-56 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors hover:bg-card-tint"
    >
      <span className="text-base">{emoji}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Link>
  );
}
