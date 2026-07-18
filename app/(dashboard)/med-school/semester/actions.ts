'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { roadmapChecklistItems, semesters } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { awardStars, touchStreakForToday, maybeUnlockAchievement } from '@/lib/gamification';

const CATEGORY_ACHIEVEMENT: Record<string, string> = {
  research: 'first_research',
  conferences: 'first_conference',
};

async function maybeUnlockNextSemester(semesterId: string, userId: string) {
  const semester = await db.query.semesters.findFirst({
    where: and(eq(semesters.id, semesterId), eq(semesters.userId, userId)),
  });
  if (!semester || semester.status === 'complete') return;

  const items = await db.query.roadmapChecklistItems.findMany({
    where: eq(roadmapChecklistItems.semesterId, semesterId),
  });
  if (items.length === 0) return;

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  if (pct < semester.unlockThresholdPct) return;

  await db
    .update(semesters)
    .set({ status: 'complete' })
    .where(eq(semesters.id, semesterId));

  const nextSemester = await db.query.semesters.findFirst({
    where: and(
      eq(semesters.yearId, semester.yearId),
      eq(semesters.semesterNumber, semester.semesterNumber + 1),
    ),
  });

  if (nextSemester && nextSemester.status === 'locked') {
    await db.update(semesters).set({ status: 'active' }).where(eq(semesters.id, nextSemester.id));
  }
}

export async function toggleChecklistItem(itemId: string) {
  const user = await requireUser();

  const item = await db.query.roadmapChecklistItems.findFirst({
    where: and(eq(roadmapChecklistItems.id, itemId), eq(roadmapChecklistItems.userId, user.userId)),
  });
  if (!item) return;

  const nextDone = !item.done;

  await db
    .update(roadmapChecklistItems)
    .set({ done: nextDone })
    .where(eq(roadmapChecklistItems.id, itemId));

  if (nextDone) {
    await awardStars(user.userId, item.starValue, `Checklist: ${item.label}`);
    await touchStreakForToday(user.userId);
    const achievementKey = CATEGORY_ACHIEVEMENT[item.category];
    if (achievementKey) await maybeUnlockAchievement(user.userId, achievementKey);
  } else {
    await awardStars(user.userId, -item.starValue, `Unchecked: ${item.label}`);
  }

  await maybeUnlockNextSemester(item.semesterId, user.userId);

  revalidatePath('/med-school/semester');
  revalidatePath('/');
}
