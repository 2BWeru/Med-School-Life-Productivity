import { and, eq, sql } from 'drizzle-orm';
import { format, subDays } from 'date-fns';
import { db } from './db';
import { users, starEvents, achievements } from './schema';

export async function awardStars(userId: string, amount: number, reason: string) {
  if (amount === 0) return;

  await db.insert(starEvents).values({ userId, amount, reason });
  await db
    .update(users)
    .set({ goldStars: sql`${users.goldStars} + ${amount}` })
    .where(eq(users.id, userId));
}

/** Call once per day a user does "meaningful" work — keeps the streak counter honest. */
export async function touchStreakForToday(userId: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return;

  if (user.lastStreakDate === today) return;

  const nextStreak = user.lastStreakDate === yesterday ? user.currentStreak + 1 : 1;

  await db
    .update(users)
    .set({ currentStreak: nextStreak, lastStreakDate: today })
    .where(eq(users.id, userId));
}

/** Unlocks a seeded achievement by key if it exists and isn't already unlocked. Safe to call repeatedly. */
export async function maybeUnlockAchievement(userId: string, key: string) {
  const achievement = await db.query.achievements.findFirst({
    where: and(eq(achievements.userId, userId), eq(achievements.key, key)),
  });
  if (!achievement || achievement.unlocked) return;

  await db
    .update(achievements)
    .set({ unlocked: true, unlockedAt: new Date() })
    .where(eq(achievements.id, achievement.id));

  await awardStars(userId, 30, `Achievement unlocked: ${achievement.label}`);
}
