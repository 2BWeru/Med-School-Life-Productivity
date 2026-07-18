'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lectureNotes } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

export async function createLectureNote(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);
  if (!semester) return;

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const content = String(formData.get('content') ?? '').trim() || null;

  await db.insert(lectureNotes).values({
    userId: user.userId,
    semesterId: semester.id,
    subjectId,
    title,
    content,
  });

  revalidatePath('/med-school/semester/lecture-notes');
  revalidatePath('/med-school/semester');
}

export async function deleteLectureNote(noteId: string) {
  const user = await requireUser();
  await db
    .delete(lectureNotes)
    .where(and(eq(lectureNotes.id, noteId), eq(lectureNotes.userId, user.userId)));

  revalidatePath('/med-school/semester/lecture-notes');
  revalidatePath('/med-school/semester');
}
