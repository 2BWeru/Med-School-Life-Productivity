import Link from 'next/link';
import { differenceInCalendarDays, format, isToday } from 'date-fns';
import { requireUser } from '@/lib/session-helpers';
import { getMedSchoolGlance } from '@/lib/med-school-glance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const AFFIRMATIONS = [
  "I don't have to know everything today — I just have to understand the why, and that's enough to begin.",
  'Small, consistent steps today build the doctor I will become tomorrow.',
  'One lecture at a time. That is all today asks of me.',
  'Falling behind for a day is not failing — ignoring it for a week is what I am protecting against.',
  'Future Dr. Betty is counting on today, but today only needs to be good enough, not perfect.',
];

function statRow(label: string, sub: string, when: string, tone: 'soon' | 'ok' | 'plain') {
  return { label, sub, when, tone };
}

export default async function MedSchoolTodayPage() {
  const user = await requireUser();
  const now = new Date();
  const affirmation = AFFIRMATIONS[now.getDate() % AFFIRMATIONS.length];

  const {
    semesterSubjects,
    todaysClasses,
    quizzesToday,
    nextExam,
    nextCat,
    nextMainExam,
    nextSgd,
    allLectures,
  } = await getMedSchoolGlance(user.userId);

  const daysUntil = (d: Date) => Math.max(0, differenceInCalendarDays(d, now));

  const rows = [
    statRow(
      `${todaysClasses.length} class${todaysClasses.length === 1 ? '' : 'es'} today`,
      todaysClasses.length > 0
        ? todaysClasses
            .map((c) => `${c.subject?.emoji ?? ''} ${c.subject?.name ?? c.label} ${c.startTime}`)
            .join(' · ')
        : 'Nothing on the timetable today',
      todaysClasses.length > 0 ? 'Today' : '—',
      todaysClasses.length > 0 ? 'soon' : 'plain',
    ),
    statRow(
      `${quizzesToday.length} quiz${quizzesToday.length === 1 ? '' : 'zes'} today`,
      quizzesToday.map((q) => q.title).join(', ') || 'No quizzes today',
      quizzesToday.length > 0 ? 'Today' : '—',
      quizzesToday.length > 0 ? 'soon' : 'plain',
    ),
    statRow(
      'Next exam',
      nextExam?.title ?? 'None scheduled',
      nextExam ? `${daysUntil(nextExam.examDate)}d` : '—',
      nextExam && daysUntil(nextExam.examDate) <= 3 ? 'soon' : 'ok',
    ),
    statRow(
      'Next CAT',
      nextCat?.title ?? 'None scheduled',
      nextCat ? `${daysUntil(nextCat.examDate)}d` : '—',
      nextCat && daysUntil(nextCat.examDate) <= 3 ? 'soon' : 'ok',
    ),
    statRow(
      'Next main exam',
      nextMainExam?.title ?? 'None scheduled',
      nextMainExam ? `${daysUntil(nextMainExam.examDate)}d` : '—',
      'plain',
    ),
    statRow(
      'SGD assignment due',
      nextSgd?.title ?? 'None due',
      nextSgd ? `${daysUntil(nextSgd.dueDate)}d` : '—',
      nextSgd && daysUntil(nextSgd.dueDate) <= 3 ? 'soon' : 'ok',
    ),
  ];

  const toneClass: Record<string, string> = {
    soon: 'bg-destructive/10 text-destructive',
    ok: 'bg-good/15 text-good',
    plain: 'bg-card-tint text-muted-foreground',
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-extrabold sm:text-2xl">Today&apos;s Lectures</h1>
        <p className="mt-1 text-sm text-muted-foreground">{format(now, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📅 Today at a glance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{row.label}</p>
                <p className="truncate text-xs text-muted-foreground">{row.sub}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${toneClass[row.tone]}`}
              >
                {row.when}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {semesterSubjects.map((s) => {
          const lastLecture = allLectures
            .filter((l) => l.subjectId === s.id)
            .sort((a, b) => b.lectureDate.localeCompare(a.lectureDate))[0];
          const hasToday = lastLecture && isToday(new Date(lastLecture.lectureDate));

          return (
            <Link
              key={s.id}
              href={`/med-school/subjects/${s.id}`}
              className="flex flex-col gap-1.5 rounded-2xl border-t-4 border-border bg-card p-4 shadow-sm transition-colors hover:bg-card-tint"
              style={{ borderTopColor: s.color }}
            >
              <span className="text-xl">{s.emoji}</span>
              <h4 className="text-sm font-extrabold">{s.name}</h4>
              <p className="text-xs font-medium text-muted-foreground">
                {hasToday ? `Today: ${lastLecture!.title}` : 'No lecture logged today'}
              </p>
              <span className="mt-0.5 text-xs font-extrabold" style={{ color: s.color }}>
                Tap to open →
              </span>
            </Link>
          );
        })}
        {semesterSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subjects linked to your current semester yet — manage them from{' '}
            <Link href="/study" className="font-bold text-primary">
              Study Tracker
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-secondary to-plum-soft p-4">
        <span className="text-2xl">🌱</span>
        <p className="text-sm font-bold text-maroon-foreground">{affirmation}</p>
      </div>
    </div>
  );
}
