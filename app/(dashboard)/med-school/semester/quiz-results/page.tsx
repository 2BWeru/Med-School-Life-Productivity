import { desc, eq } from 'drizzle-orm';
import { format, parseISO } from 'date-fns';
import { db } from '@/lib/db';
import { quizResults, subjects } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { ResultForm } from './result-form';
import { deleteQuizResult } from './actions';

export const dynamic = 'force-dynamic';

export default async function QuizResultsPage() {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const [userSubjects, results] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    semester
      ? db.query.quizResults.findMany({
          where: eq(quizResults.semesterId, semester.id),
          orderBy: [desc(quizResults.resultDate)],
          with: { subject: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Quiz Results" description="Track how each quiz went this semester." />

      <Card>
        <CardHeader>
          <CardTitle>Log a quiz result</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quiz results logged yet.</p>
          ) : (
            results.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {r.subject ? `${r.subject.emoji} ` : ''}
                    {r.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(parseISO(r.resultDate), 'MMM d, yyyy')}
                    {r.score !== null && r.maxScore !== null ? ` · ${r.score}/${r.maxScore}` : ''}
                  </p>
                </div>
                <DeleteRowButton action={deleteQuizResult.bind(null, r.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
