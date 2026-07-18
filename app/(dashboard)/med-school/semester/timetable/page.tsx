import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { timetableEntries, subjects } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { TimetableForm } from './timetable-form';
import { deleteTimetableEntry } from './actions';

export const dynamic = 'force-dynamic';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function TimetablePage() {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const [userSubjects, entries] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    semester
      ? db.query.timetableEntries.findMany({
          where: eq(timetableEntries.semesterId, semester.id),
          with: { subject: true },
        })
      : Promise.resolve([]),
  ]);

  const byDay = DAYS.map((day, i) => ({
    day,
    entries: entries
      .filter((e) => e.dayOfWeek === i)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Timetable" description="Your weekly class schedule for this semester." />

      <Card>
        <CardHeader>
          <CardTitle>Add a class</CardTitle>
          <CardDescription>Build out your recurring weekly timetable.</CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {byDay
          .filter((d) => d.entries.length > 0)
          .map((d) => (
            <Card key={d.day}>
              <CardHeader>
                <CardTitle className="text-sm">{d.day}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border">
                {d.entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {e.startTime}–{e.endTime} · {e.label}
                      </p>
                      {e.subject ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {e.subject.emoji} {e.subject.name}
                        </p>
                      ) : null}
                    </div>
                    <DeleteRowButton action={deleteTimetableEntry.bind(null, e.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes added yet.</p>
        ) : null}
      </div>
    </div>
  );
}
