import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subjects, lectures } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LectureForm } from './lecture-form';
import { LectureChecklist } from './lecture-checklist';

export const dynamic = 'force-dynamic';

export default async function SubjectDetailPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const user = await requireUser();

  const subject = await db.query.subjects.findFirst({
    where: and(eq(subjects.id, params.subjectId), eq(subjects.userId, user.userId)),
  });
  if (!subject) notFound();

  const subjectLectures = await db.query.lectures.findMany({
    where: eq(lectures.subjectId, subject.id),
    orderBy: [desc(lectures.lectureDate)],
  });

  const [featured, ...older] = subjectLectures;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-2xl border-t-4 bg-card p-4 shadow-sm" style={{ borderTopColor: subject.color }}>
        <span className="text-2xl">{subject.emoji}</span>
        <div>
          <h1 className="font-display text-lg font-extrabold">{subject.name}</h1>
          <p className="text-xs font-semibold text-muted-foreground">
            {subject.weeklyHourGoal ? `${subject.weeklyHourGoal} hrs/wk goal` : 'No weekly goal set'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{featured ? 'Log another lecture' : "Log today's lecture"}</CardTitle>
          <CardDescription>Set the why and roadmap first — that&apos;s the entry point.</CardDescription>
        </CardHeader>
        <CardContent>
          <LectureForm subjectId={subject.id} />
        </CardContent>
      </Card>

      {featured ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{featured.title}</CardTitle>
              <CardDescription>{format(parseISO(featured.lectureDate), 'EEEE, MMM d, yyyy')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {featured.whyItMatters ? (
              <div className="rounded-xl bg-secondary p-4">
                <span className="mb-1 block text-[10.5px] font-extrabold uppercase tracking-wide text-maroon">
                  🌱 Why this matters
                </span>
                <p className="text-sm font-semibold text-maroon-foreground">{featured.whyItMatters}</p>
              </div>
            ) : null}

            {featured.roadmapConnections ? (
              <div>
                <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  🗺️ How this connects
                </span>
                <p className="text-sm font-medium">{featured.roadmapConnections}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {featured.lectureUrl ? (
                <a
                  href={featured.lectureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-card-tint px-3.5 py-2 text-xs font-bold"
                >
                  🎥 Watch lecture
                </a>
              ) : null}
              {featured.notebookLmPrompt ? (
                <span className="rounded-lg bg-card-tint px-3.5 py-2 text-xs font-bold">
                  🧠 NotebookLM prompt ready
                </span>
              ) : null}
              {featured.questionsUrl ? (
                <a
                  href={featured.questionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-card-tint px-3.5 py-2 text-xs font-bold"
                >
                  ❓ Practice questions
                </a>
              ) : null}
              {featured.mnemonics ? (
                <span className="rounded-lg bg-card-tint px-3.5 py-2 text-xs font-bold">🔤 Mnemonics</span>
              ) : null}
            </div>

            {(featured.summary || featured.mnemonics) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {featured.summary ? (
                  <div className="rounded-xl bg-card-tint p-3.5">
                    <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                      📄 Summary
                    </span>
                    <p className="text-xs leading-relaxed">{featured.summary}</p>
                  </div>
                ) : null}
                {featured.mnemonics ? (
                  <div className="rounded-xl bg-gold-soft p-3.5">
                    <span className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-wide text-gold-foreground">
                      🔤 Mnemonic
                    </span>
                    <p className="text-xs font-semibold leading-relaxed">{featured.mnemonics}</p>
                  </div>
                ) : null}
              </div>
            )}

            <LectureChecklist
              lectureId={featured.id}
              subjectName={subject.name}
              flags={{
                whyReviewed: featured.whyReviewed,
                lectureWatched: featured.lectureWatched,
                questionsDone: featured.questionsDone,
                recallDone: featured.recallDone,
              }}
              recallNotes={featured.recallNotes ?? ''}
            />

            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              <span className="rounded-full bg-card-tint px-3 py-1 text-xs font-bold text-muted-foreground">📁 Drive</span>
              <span className="rounded-full bg-card-tint px-3 py-1 text-xs font-bold text-muted-foreground">📅 Calendar</span>
              <span className="rounded-full bg-card-tint px-3 py-1 text-xs font-bold text-muted-foreground">🧠 NotebookLM</span>
              <span className="rounded-full bg-card-tint px-3 py-1 text-xs font-bold text-muted-foreground">📆 Calendly</span>
              <span className="rounded-full bg-card-tint px-3 py-1 text-xs font-bold text-muted-foreground">💬 Messages</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {older.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Past lectures ({older.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {older.map((l) => (
              <div key={l.id} className="py-2.5">
                <p className="text-sm font-semibold">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(l.lectureDate), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
