'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { assignments } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

const TYPES = ['sgd', 'coursework', 'other'] as const;

function asType(value: FormDataEntryValue | null): (typeof TYPES)[number] {
  const v = String(value ?? '');
  return (TYPES as readonly string[]).includes(v) ? (v as (typeof TYPES)[number]) : 'coursework';
}

export async function createAssignment(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);
  if (!semester) return;

  const title = String(formData.get('title') ?? '').trim();
  const dueDateRaw = String(formData.get('dueDate') ?? '');
  if (!title || !dueDateRaw) return;

  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const type = asType(formData.get('type'));
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(assignments).values({
    userId: user.userId,
    semesterId: semester.id,
    subjectId,
    title,
    type,
    dueDate: new Date(dueDateRaw),
    notes,
  });

  revalidatePath('/med-school/semester/assignments');
  revalidatePath('/med-school/semester');
  revalidatePath('/med-school');
  revalidatePath('/');
}

export async function toggleAssignmentSubmitted(assignmentId: string) {
  const user = await requireUser();

  const item = await db.query.assignments.findFirst({
    where: and(eq(assignments.id, assignmentId), eq(assignments.userId, user.userId)),
  });
  if (!item) return;

  await db
    .update(assignments)
    .set({ submitted: !item.submitted })
    .where(eq(assignments.id, assignmentId));

  revalidatePath('/med-school/semester/assignments');
  revalidatePath('/med-school/semester');
}

export async function deleteAssignment(assignmentId: string) {
  const user = await requireUser();
  await db
    .delete(assignments)
    .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, user.userId)));

  revalidatePath('/med-school/semester/assignments');
  revalidatePath('/med-school/semester');
}
