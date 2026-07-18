import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { assignments, subjects } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AssignmentForm } from './assignment-form';
import { AssignmentRow } from './assignment-row';

export const dynamic = 'force-dynamic';

export default async function AssignmentsPage() {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const [userSubjects, items] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    semester
      ? db.query.assignments.findMany({
          where: eq(assignments.semesterId, semester.id),
          orderBy: [asc(assignments.dueDate)],
          with: { subject: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Assignments" description="SGD write-ups and coursework due this semester." />

      <Card>
        <CardHeader>
          <CardTitle>Add an assignment</CardTitle>
          <CardDescription>Feeds the &quot;SGD assignment due&quot; stat on your Today page.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All assignments ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments added yet.</p>
          ) : (
            items.map((a) => <AssignmentRow key={a.id} assignment={a} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
