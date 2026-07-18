'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { birthdays } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

export async function createBirthday(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get('name') ?? '').trim();
  const dateRaw = String(formData.get('date') ?? '');
  if (!name || !dateRaw) return;

  const [, month, day] = dateRaw.split('-').map(Number);
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(birthdays).values({ userId: user.userId, name, month, day, notes });

  revalidatePath('/personal/birthdays');
  revalidatePath('/');
}

export async function deleteBirthday(birthdayId: string) {
  const user = await requireUser();
  await db
    .delete(birthdays)
    .where(and(eq(birthdays.id, birthdayId), eq(birthdays.userId, user.userId)));

  revalidatePath('/personal/birthdays');
  revalidatePath('/');
}
