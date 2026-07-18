'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subjects, studySessions } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

const SUBJECT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export async function createSubject(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const color = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];

  await db.insert(subjects).values({ userId: user.userId, name, color });

  revalidatePath('/study');
  revalidatePath('/tasks');
  revalidatePath('/exams');
}

export async function deleteSubject(subjectId: string) {
  const user = await requireUser();

  await db.delete(subjects).where(and(eq(subjects.id, subjectId), eq(subjects.userId, user.userId)));

  revalidatePath('/study');
  revalidatePath('/tasks');
  revalidatePath('/exams');
}

export async function logStudySession(formData: FormData) {
  const user = await requireUser();

  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const durationMinutes = Number(formData.get('durationMinutes') ?? 0);
  const sessionDate = String(formData.get('sessionDate') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!durationMinutes || durationMinutes <= 0 || !sessionDate) return;

  await db.insert(studySessions).values({
    userId: user.userId,
    subjectId,
    durationMinutes: Math.round(durationMinutes),
    sessionDate,
    notes,
  });

  revalidatePath('/study');
  revalidatePath('/');
}

export async function deleteStudySession(sessionId: string) {
  const user = await requireUser();

  await db
    .delete(studySessions)
    .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, user.userId)));

  revalidatePath('/study');
  revalidatePath('/');
}
