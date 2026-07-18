'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { timetableEntries } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

export async function createTimetableEntry(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);
  if (!semester) return;

  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const dayOfWeek = Number(formData.get('dayOfWeek') ?? 0);
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const label = String(formData.get('label') ?? '').trim() || 'Lecture';

  if (!startTime || !endTime) return;

  await db.insert(timetableEntries).values({
    userId: user.userId,
    semesterId: semester.id,
    subjectId,
    dayOfWeek,
    startTime,
    endTime,
    label,
  });

  revalidatePath('/med-school/semester/timetable');
  revalidatePath('/med-school/semester');
  revalidatePath('/med-school');
  revalidatePath('/');
}

export async function deleteTimetableEntry(entryId: string) {
  const user = await requireUser();
  await db
    .delete(timetableEntries)
    .where(and(eq(timetableEntries.id, entryId), eq(timetableEntries.userId, user.userId)));

  revalidatePath('/med-school/semester/timetable');
  revalidatePath('/med-school/semester');
  revalidatePath('/med-school');
  revalidatePath('/');
}
