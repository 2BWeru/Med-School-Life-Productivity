'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { journalEntries } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

export async function saveJournalEntry(formData: FormData) {
  const user = await requireUser();

  const entryDate = String(formData.get('entryDate') ?? '');
  const mood = Number(formData.get('mood') ?? 0);
  const content = String(formData.get('content') ?? '').trim() || null;

  if (!entryDate || mood < 1 || mood > 5) return;

  await db
    .insert(journalEntries)
    .values({ userId: user.userId, entryDate, mood, content })
    .onConflictDoUpdate({
      target: [journalEntries.userId, journalEntries.entryDate],
      set: { mood, content },
    });

  revalidatePath('/journal');
  revalidatePath('/');
}

export async function deleteJournalEntry(entryId: string) {
  const user = await requireUser();

  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, user.userId)));

  revalidatePath('/journal');
  revalidatePath('/');
}
