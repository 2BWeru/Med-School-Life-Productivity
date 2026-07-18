'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { lectures } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { awardStars, touchStreakForToday } from '@/lib/gamification';

const LECTURE_FLAGS = ['whyReviewed', 'lectureWatched', 'questionsDone', 'recallDone'] as const;
type LectureFlag = (typeof LECTURE_FLAGS)[number];

export async function createLecture(subjectId: string, formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  await db.insert(lectures).values({
    userId: user.userId,
    subjectId,
    title,
    lectureDate: format(new Date(), 'yyyy-MM-dd'),
    whyItMatters: String(formData.get('whyItMatters') ?? '').trim() || null,
    roadmapConnections: String(formData.get('roadmapConnections') ?? '').trim() || null,
    summary: String(formData.get('summary') ?? '').trim() || null,
    mnemonics: String(formData.get('mnemonics') ?? '').trim() || null,
    lectureUrl: String(formData.get('lectureUrl') ?? '').trim() || null,
    notebookLmPrompt: String(formData.get('notebookLmPrompt') ?? '').trim() || null,
    questionsUrl: String(formData.get('questionsUrl') ?? '').trim() || null,
  });

  revalidatePath(`/med-school/subjects/${subjectId}`);
  revalidatePath('/med-school');
  revalidatePath('/');
}

export async function toggleLectureFlag(lectureId: string, flag: LectureFlag) {
  const user = await requireUser();

  const lecture = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, lectureId), eq(lectures.userId, user.userId)),
  });
  if (!lecture) return;

  const nextValue = !lecture[flag];

  await db
    .update(lectures)
    .set({ [flag]: nextValue })
    .where(eq(lectures.id, lectureId));

  if (nextValue) {
    await awardStars(user.userId, 5, `Lecture progress: ${lecture.title}`);
    await touchStreakForToday(user.userId);
  } else {
    await awardStars(user.userId, -5, `Unchecked: ${lecture.title}`);
  }

  revalidatePath(`/med-school/subjects/${lecture.subjectId}`);
  revalidatePath('/med-school');
  revalidatePath('/');
}

export async function saveRecallNotes(lectureId: string, notes: string) {
  const user = await requireUser();

  const lecture = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, lectureId), eq(lectures.userId, user.userId)),
  });
  if (!lecture) return;

  await db.update(lectures).set({ recallNotes: notes }).where(eq(lectures.id, lectureId));

  revalidatePath(`/med-school/subjects/${lecture.subjectId}`);
}
