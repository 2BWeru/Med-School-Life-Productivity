import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  programYears,
  semesters,
  roadmapChecklistItems,
  subjects,
  timetableEntries,
  assignments,
  lectureNotes,
  pastExamQuestions,
  quizResults,
  examResults,
  applications,
  clubs,
} from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChecklistItem } from './checklist-item';

export const dynamic = 'force-dynamic';

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  academics: { label: 'Academics', emoji: '📚' },
  career: { label: 'Career', emoji: '💼' },
  volunteering: { label: 'Volunteering', emoji: '❤️' },
  research: { label: 'Research', emoji: '🔬' },
  certifications: { label: 'Certifications', emoji: '🎓' },
  conferences: { label: 'Conferences', emoji: '🎤' },
  summer: { label: 'Summer Mission', emoji: '🌞' },
};

const CATEGORY_ORDER = [
  'academics',
  'career',
  'volunteering',
  'research',
  'certifications',
  'conferences',
  'summer',
];

export default async function SemesterPlannerPage() {
  const user = await requireUser();

  const currentYear = await db.query.programYears.findFirst({
    where: eq(programYears.userId, user.userId),
    orderBy: [asc(programYears.yearNumber)],
  });

  if (!currentYear) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Semester Planner" />
        <p className="text-sm text-muted-foreground">No program year set up yet.</p>
      </div>
    );
  }

  const yearSemesters = await db.query.semesters.findMany({
    where: eq(semesters.yearId, currentYear.id),
    orderBy: [asc(semesters.semesterNumber)],
  });

  const activeSemester =
    yearSemesters.find((s) => s.status === 'active') ?? yearSemesters[0] ?? null;

  if (!activeSemester) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Semester Planner" />
        <p className="text-sm text-muted-foreground">No semesters set up yet.</p>
      </div>
    );
  }

  const [checklistItems, semesterSubjects, submissionCounts] = await Promise.all([
    db.query.roadmapChecklistItems.findMany({
      where: eq(roadmapChecklistItems.semesterId, activeSemester.id),
    }),
    db.query.subjects.findMany({ where: eq(subjects.semesterId, activeSemester.id) }),
    Promise.all([
      db.query.timetableEntries.findMany({
        where: eq(timetableEntries.semesterId, activeSemester.id),
      }),
      db.query.lectureNotes.findMany({ where: eq(lectureNotes.semesterId, activeSemester.id) }),
      db.query.pastExamQuestions.findMany({
        where: eq(pastExamQuestions.semesterId, activeSemester.id),
      }),
      db.query.quizResults.findMany({ where: eq(quizResults.semesterId, activeSemester.id) }),
      db.query.examResults.findMany({ where: eq(examResults.semesterId, activeSemester.id) }),
      db.query.applications.findMany({ where: eq(applications.semesterId, activeSemester.id) }),
      db.query.clubs.findMany({ where: eq(clubs.semesterId, activeSemester.id) }),
      db.query.assignments.findMany({ where: eq(assignments.semesterId, activeSemester.id) }),
    ]),
  ]);

  const [
    timetableCount,
    lectureNotesCount,
    pastExamCount,
    quizResultsCount,
    examResultsCount,
    applicationsCount,
    clubsCount,
    assignmentsCount,
  ] = submissionCounts.map((rows) => rows.length);

  const doneCount = checklistItems.filter((i) => i.done).length;
  const totalCount = checklistItems.length;
  const pctDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: checklistItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const otherSemester = yearSemesters.find((s) => s.id !== activeSemester.id);

  const submissionTiles = [
    { emoji: '🗓️', label: 'Timetable', count: timetableCount, href: '/med-school/semester/timetable' },
    { emoji: '📓', label: 'Lecture notes', count: lectureNotesCount, href: '/med-school/semester/lecture-notes' },
    { emoji: '📄', label: 'Past exam questions', count: pastExamCount, href: '/med-school/semester/past-exams' },
    { emoji: '📊', label: 'Quiz results', count: quizResultsCount, href: '/med-school/semester/quiz-results' },
    { emoji: '🎓', label: 'Exam results', count: examResultsCount, href: '/med-school/semester/exam-results' },
    { emoji: '📮', label: 'Applications', count: applicationsCount, href: '/med-school/semester/applications' },
    { emoji: '🏛️', label: 'Clubs joined', count: clubsCount, href: '/med-school/semester/clubs' },
    { emoji: '📝', label: 'Assignments', count: assignmentsCount, href: '/med-school/semester/assignments' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-gradient-to-r from-secondary to-card p-5">
        <h1 className="font-display text-xl font-extrabold">
          Year {currentYear.yearNumber} · Semester {activeSemester.semesterNumber} — {currentYear.theme}
        </h1>
        <p className="mt-1 text-sm font-semibold italic text-maroon">&quot;{currentYear.quote}&quot;</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2.5">
          {yearSemesters.map((s) => (
            <span
              key={s.id}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-bold',
                s.status === 'active' && 'border-transparent bg-secondary text-secondary-foreground',
                s.status === 'locked' && 'border-border bg-card-tint text-muted-foreground opacity-80',
                s.status === 'complete' && 'border-transparent bg-good/15 text-good',
              )}
            >
              {s.status === 'locked' ? '🔒' : s.status === 'complete' ? '✅' : '🌱'} Semester{' '}
              {s.semesterNumber}
              {s.id === activeSemester.id ? (
                <b className="font-extrabold">
                  {' '}
                  · {s.status === 'complete' ? 'complete' : 'active'}
                </b>
              ) : (
                <b className="font-extrabold"> · {pctDone}% stars, not yet complete</b>
              )}
            </span>
          ))}
        </div>
        {otherSemester?.status === 'locked' ? (
          <p className="text-xs italic text-muted-foreground">
            Semester {otherSemester.semesterNumber} unlocks once Semester{' '}
            {activeSemester.semesterNumber} is marked complete <b>and</b> 80% of its gold stars
            are earned. Right now that&apos;s {pctDone}%.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          Semester {activeSemester.semesterNumber} checklist — straight from your roadmap ({doneCount}/{totalCount})
        </h2>
        <Card>
          <CardContent className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((group) => (
              <div key={group.category} className="flex flex-col gap-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-maroon">
                  {CATEGORY_META[group.category]?.emoji} {CATEGORY_META[group.category]?.label}
                </span>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <ChecklistItem key={item.id} id={item.id} label={item.label} done={item.done} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <p className="text-xs font-semibold text-muted-foreground">
          Each item you tick pays out gold stars toward unlocking the next semester ⭐
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          Submit to this semester
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {submissionTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:bg-card-tint"
            >
              <span className="text-lg">{tile.emoji}</span>
              <span className="text-[13px] font-bold">{tile.label}</span>
              <span className="text-[11.5px] font-semibold text-muted-foreground">
                {tile.count} {tile.count === 1 ? 'entry' : 'entries'}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          This semester&apos;s subjects
        </h2>
        {semesterSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subjects linked to this semester yet — manage them from{' '}
            <Link href="/study" className="font-bold text-primary">
              Study Tracker
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {semesterSubjects.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-bold shadow-sm"
              >
                {s.emoji} {s.name}
                <span className="font-semibold text-muted-foreground">
                  {s.weeklyHourGoal ? `${s.weeklyHourGoal} hrs/wk goal` : 'no goal set'}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔒 End of semester</CardTitle>
          <CardDescription>
            {activeSemester.status === 'complete'
              ? 'Semester complete! Highlights and celebration page coming soon.'
              : `Unlocks when Semester ${activeSemester.semesterNumber} is marked complete — your highlights, biggest lesson, and celebration page.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg bg-gold-soft px-4 py-3 text-[13px] font-semibold text-gold-foreground">
            ✨ Finish the checklist above to reach 80% and unlock the next semester automatically —
            pre-built from your roadmap, ready to fill in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
