'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { gymLogs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { awardStars, touchStreakForToday } from '@/lib/gamification';

export async function logGymSession(formData: FormData) {
  const user = await requireUser();

  const workoutType = String(formData.get('workoutType') ?? '').trim();
  const logDate = String(formData.get('logDate') ?? '');
  if (!workoutType || !logDate) return;

  const durationRaw = String(formData.get('durationMinutes') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(gymLogs).values({
    userId: user.userId,
    logDate,
    workoutType,
    durationMinutes: durationRaw ? Number(durationRaw) : null,
    notes,
  });

  await awardStars(user.userId, 5, `Gym: ${workoutType}`);
  await touchStreakForToday(user.userId);

  revalidatePath('/personal/gym');
  revalidatePath('/');
}

export async function deleteGymLog(logId: string) {
  const user = await requireUser();
  await db.delete(gymLogs).where(and(eq(gymLogs.id, logId), eq(gymLogs.userId, user.userId)));

  revalidatePath('/personal/gym');
  revalidatePath('/');
}
