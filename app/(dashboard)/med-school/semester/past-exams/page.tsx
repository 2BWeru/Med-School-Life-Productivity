import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pastExamQuestions, subjects } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { ExamQForm } from './exam-q-form';
import { deletePastExamQuestion } from './actions';

export const dynamic = 'force-dynamic';

export default async function PastExamsPage() {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const [userSubjects, items] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    semester
      ? db.query.pastExamQuestions.findMany({
          where: eq(pastExamQuestions.semesterId, semester.id),
          orderBy: [desc(pastExamQuestions.createdAt)],
          with: { subject: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Past Exam Questions" description="A bank of past questions for this semester." />

      <Card>
        <CardHeader>
          <CardTitle>Add questions</CardTitle>
          <CardDescription>Paste in past paper questions to build your own bank.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExamQForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All entries ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing added yet.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.subject ? `${item.subject.emoji} ` : ''}
                    {item.title}
                  </p>
                  {item.content ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                      {item.content}
                    </p>
                  ) : null}
                </div>
                <DeleteRowButton action={deletePastExamQuestion.bind(null, item.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
