import { asc, eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { db } from '@/lib/db';
import { subjects, exams } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { AddExamForm } from './add-exam-form';
import { ExamCard } from './exam-card';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const user = await requireUser();

  const [userSubjects, userExams] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    db.query.exams.findMany({
      where: eq(exams.userId, user.userId),
      orderBy: [asc(exams.examDate)],
      with: { subject: true },
    }),
  ]);

  const now = Date.now();
  const upcoming = userExams.filter((e) => e.examDate.getTime() >= now);
  const past = userExams.filter((e) => e.examDate.getTime() < now).reverse();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Exams & Deadlines"
        description="Track exams, OSCEs, and rotation deadlines with a running countdown."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add exam or deadline</CardTitle>
          <CardDescription>Stay ahead of what&apos;s coming up.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddExamForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nothing upcoming — you&apos;re all caught up.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Past ({past.length})</h2>
          <div className="flex flex-col gap-3 opacity-70">
            {past.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
