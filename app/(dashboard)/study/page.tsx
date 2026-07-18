import { desc, eq } from 'drizzle-orm';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { db } from '@/lib/db';
import { subjects, studySessions } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { SubjectManager } from './subject-manager';
import { LogSessionForm } from './log-session-form';
import { SessionList } from './session-list';
import { WeeklyChart } from './weekly-chart';

export const dynamic = 'force-dynamic';

export default async function StudyPage() {
  const user = await requireUser();

  const [userSubjects, recentSessions] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    db.query.studySessions.findMany({
      where: eq(studySessions.userId, user.userId),
      orderBy: [desc(studySessions.sessionDate), desc(studySessions.createdAt)],
      with: { subject: true },
      limit: 25,
    }),
  ]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const minutes = recentSessions
      .filter((s) => s.sessionDate === date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return { date, minutes };
  });

  const weeklyTotalMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Study Tracker"
        description="Log study sessions by subject and keep an eye on your weekly rhythm."
      />

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Manage the subjects and rotations you&apos;re tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectManager subjects={userSubjects} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log a session</CardTitle>
            <CardDescription>Record time spent studying.</CardDescription>
          </CardHeader>
          <CardContent>
            <LogSessionForm subjects={userSubjects} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
            <CardDescription>
              {(weeklyTotalMinutes / 60).toFixed(1)} hours studied this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart days={last7Days} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionList sessions={recentSessions} />
        </CardContent>
      </Card>
    </div>
  );
}
