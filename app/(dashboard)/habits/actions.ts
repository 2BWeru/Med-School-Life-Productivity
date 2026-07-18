'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { habits, habitLogs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

const HABIT_COLORS = ['#6366f1', '#22c55e', '#06b6d4', '#f97316', '#ec4899', '#8b5cf6'];

export async function createHabit(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const color = HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];

  await db.insert(habits).values({ userId: user.userId, name, color });

  revalidatePath('/habits');
  revalidatePath('/');
}

export async function deleteHabit(habitId: string) {
  const user = await requireUser();

  await db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, user.userId)));

  revalidatePath('/habits');
  revalidatePath('/');
}

export async function toggleHabitLog(habitId: string, logDate: string) {
  const user = await requireUser();

  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, habitId), eq(habits.userId, user.userId)),
  });
  if (!habit) return;

  const existing = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, logDate)),
  });

  if (existing) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existing.id));
  } else {
    await db.insert(habitLogs).values({ habitId, logDate });
  }

  revalidatePath('/habits');
  revalidatePath('/');
}
