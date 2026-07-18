'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clubs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';

export async function createClub(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const role = String(formData.get('role') ?? '').trim() || null;
  const joinedDateRaw = String(formData.get('joinedDate') ?? '');

  await db.insert(clubs).values({
    userId: user.userId,
    semesterId: semester?.id ?? null,
    name,
    role,
    joinedDate: joinedDateRaw || null,
  });

  revalidatePath('/med-school/semester/clubs');
  revalidatePath('/med-school/semester');
}

export async function deleteClub(clubId: string) {
  const user = await requireUser();
  await db.delete(clubs).where(and(eq(clubs.id, clubId), eq(clubs.userId, user.userId)));

  revalidatePath('/med-school/semester/clubs');
  revalidatePath('/med-school/semester');
}
