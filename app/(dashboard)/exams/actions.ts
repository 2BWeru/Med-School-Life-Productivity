'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { exams } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

const EXAM_TYPES = ['exam', 'quiz', 'cat', 'main_exam', 'osce', 'practical', 'rotation_end'] as const;

function asExamType(value: FormDataEntryValue | null): (typeof EXAM_TYPES)[number] {
  const v = String(value ?? '');
  return (EXAM_TYPES as readonly string[]).includes(v)
    ? (v as (typeof EXAM_TYPES)[number])
    : 'exam';
}

export async function createExam(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get('title') ?? '').trim();
  const examDateRaw = String(formData.get('examDate') ?? '');
  if (!title || !examDateRaw) return;

  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const examType = asExamType(formData.get('examType'));
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(exams).values({
    userId: user.userId,
    title,
    subjectId,
    examType,
    examDate: new Date(examDateRaw),
    notes,
  });

  revalidatePath('/exams');
  revalidatePath('/');
}

export async function deleteExam(examId: string) {
  const user = await requireUser();

  await db.delete(exams).where(and(eq(exams.id, examId), eq(exams.userId, user.userId)));

  revalidatePath('/exams');
  revalidatePath('/');
}
