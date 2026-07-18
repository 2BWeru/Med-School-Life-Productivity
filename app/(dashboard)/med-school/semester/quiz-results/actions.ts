'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { quizResults } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

export async function createQuizResult(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);
  if (!semester) return;

  const title = String(formData.get('title') ?? '').trim();
  const resultDate = String(formData.get('resultDate') ?? '');
  if (!title || !resultDate) return;

  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const scoreRaw = String(formData.get('score') ?? '');
  const maxScoreRaw = String(formData.get('maxScore') ?? '');

  await db.insert(quizResults).values({
    userId: user.userId,
    semesterId: semester.id,
    subjectId,
    title,
    score: scoreRaw ? Number(scoreRaw) : null,
    maxScore: maxScoreRaw ? Number(maxScoreRaw) : null,
    resultDate,
  });

  revalidatePath('/med-school/semester/quiz-results');
  revalidatePath('/med-school/semester');
}

export async function deleteQuizResult(resultId: string) {
  const user = await requireUser();
  await db
    .delete(quizResults)
    .where(and(eq(quizResults.id, resultId), eq(quizResults.userId, user.userId)));

  revalidatePath('/med-school/semester/quiz-results');
  revalidatePath('/med-school/semester');
}
