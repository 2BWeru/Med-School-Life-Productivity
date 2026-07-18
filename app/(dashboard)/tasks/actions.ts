'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

const CATEGORIES = ['academic', 'clinical', 'personal', 'health'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;
const STATUSES = ['todo', 'in_progress', 'done'] as const;

function asEnum<T extends readonly string[]>(
  values: T,
  value: FormDataEntryValue | null,
): T[number] {
  const v = String(value ?? '');
  return (values as readonly string[]).includes(v) ? (v as T[number]) : (values[0] as T[number]);
}

export async function createTask(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const description = String(formData.get('description') ?? '').trim() || null;
  const category = asEnum(CATEGORIES, formData.get('category'));
  const priority = asEnum(PRIORITIES, formData.get('priority'));
  const subjectId = String(formData.get('subjectId') ?? '') || null;
  const dueDateRaw = String(formData.get('dueDate') ?? '');
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  await db.insert(tasks).values({
    userId: user.userId,
    title,
    description,
    category,
    priority,
    subjectId,
    dueDate,
  });

  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function setTaskStatus(taskId: string, status: (typeof STATUSES)[number]) {
  const user = await requireUser();

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.userId)));

  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function deleteTask(taskId: string) {
  const user = await requireUser();

  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, user.userId)));

  revalidatePath('/tasks');
  revalidatePath('/');
}
