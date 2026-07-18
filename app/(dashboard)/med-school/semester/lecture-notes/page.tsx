import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lectureNotes, subjects } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { NoteForm } from './note-form';
import { deleteLectureNote } from './actions';

export const dynamic = 'force-dynamic';

export default async function LectureNotesPage() {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const [userSubjects, notes] = await Promise.all([
    db.query.subjects.findMany({ where: eq(subjects.userId, user.userId) }),
    semester
      ? db.query.lectureNotes.findMany({
          where: eq(lectureNotes.semesterId, semester.id),
          orderBy: [desc(lectureNotes.createdAt)],
          with: { subject: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lecture Notes" description="Notes you've captured for this semester." />

      <Card>
        <CardHeader>
          <CardTitle>Add a note</CardTitle>
          <CardDescription>Save it here so it&apos;s always attached to this semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <NoteForm subjects={userSubjects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All notes ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {n.subject ? `${n.subject.emoji} ` : ''}
                    {n.title}
                  </p>
                  {n.content ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                      {n.content}
                    </p>
                  ) : null}
                </div>
                <DeleteRowButton action={deleteLectureNote.bind(null, n.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
