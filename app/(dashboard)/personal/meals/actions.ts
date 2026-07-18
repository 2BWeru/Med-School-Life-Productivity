'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { foodPreferences, mealPlans } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

export async function addFoodPreference(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  await db.insert(foodPreferences).values({ userId: user.userId, name });

  revalidatePath('/personal/meals');
  revalidatePath('/');
}

export async function deleteFoodPreference(prefId: string) {
  const user = await requireUser();
  await db
    .delete(foodPreferences)
    .where(and(eq(foodPreferences.id, prefId), eq(foodPreferences.userId, user.userId)));

  revalidatePath('/personal/meals');
  revalidatePath('/');
}

function pickRotated(pool: string[], recentlyUsed: Set<string>, count: number): string[] {
  const fresh = pool.filter((f) => !recentlyUsed.has(f));
  const candidates = fresh.length >= count ? fresh : pool;
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function shuffleTodayPlan() {
  const user = await requireUser();
  const today = format(new Date(), 'yyyy-MM-dd');

  const prefs = await db.query.foodPreferences.findMany({
    where: eq(foodPreferences.userId, user.userId),
  });
  if (prefs.length === 0) return;

  const recentPlans = await db.query.mealPlans.findMany({
    where: eq(mealPlans.userId, user.userId),
    orderBy: [desc(mealPlans.planDate)],
    limit: 3,
  });

  const recentlyUsed = new Set(
    recentPlans.flatMap((p) => [p.breakfast, p.lunch, p.snack].filter(Boolean) as string[]),
  );

  const names = prefs.map((p) => p.name);
  const [breakfast, lunch, snack] = pickRotated(names, recentlyUsed, 3);

  await db
    .insert(mealPlans)
    .values({ userId: user.userId, planDate: today, breakfast, lunch, snack })
    .onConflictDoUpdate({
      target: [mealPlans.userId, mealPlans.planDate],
      set: { breakfast, lunch, snack },
    });

  revalidatePath('/personal/meals');
  revalidatePath('/');
}
