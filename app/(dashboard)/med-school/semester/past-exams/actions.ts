'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pastExamQuestions } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

export async function createPastExamQuestion(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);
  if (!semester) return;

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const content = String(formData.get('content') ?? '').trim() || null;

  await db.insert(pastExamQuestions).values({
    userId: user.userId,
    semesterId: semester.id,
    subjectId,
    title,
    content,
  });

  revalidatePath('/med-school/semester/past-exams');
  revalidatePath('/med-school/semester');
}

export async function deletePastExamQuestion(itemId: string) {
  const user = await requireUser();
  await db
    .delete(pastExamQuestions)
    .where(and(eq(pastExamQuestions.id, itemId), eq(pastExamQuestions.userId, user.userId)));

  revalidatePath('/med-school/semester/past-exams');
  revalidatePath('/med-school/semester');
}
