'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { financeEntries } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

const CATEGORIES = ['rent', 'utilities', 'other'] as const;

function asCategory(value: FormDataEntryValue | null): (typeof CATEGORIES)[number] {
  const v = String(value ?? '');
  return (CATEGORIES as readonly string[]).includes(v) ? (v as (typeof CATEGORIES)[number]) : 'other';
}

export async function createFinanceEntry(formData: FormData) {
  const user = await requireUser();

  const label = String(formData.get('label') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '');
  if (!label || !amountRaw) return;

  const category = asCategory(formData.get('category'));
  const dueDateRaw = String(formData.get('dueDate') ?? '');

  await db.insert(financeEntries).values({
    userId: user.userId,
    category,
    label,
    amount: amountRaw,
    dueDate: dueDateRaw || null,
  });

  revalidatePath('/personal/finances');
  revalidatePath('/');
}

export async function markFinanceEntryPaid(entryId: string) {
  const user = await requireUser();

  const entry = await db.query.financeEntries.findFirst({
    where: and(eq(financeEntries.id, entryId), eq(financeEntries.userId, user.userId)),
  });
  if (!entry) return;

  await db
    .update(financeEntries)
    .set({
      paid: !entry.paid,
      paidDate: !entry.paid ? format(new Date(), 'yyyy-MM-dd') : null,
    })
    .where(eq(financeEntries.id, entryId));

  revalidatePath('/personal/finances');
  revalidatePath('/');
}

export async function deleteFinanceEntry(entryId: string) {
  const user = await requireUser();
  await db
    .delete(financeEntries)
    .where(and(eq(financeEntries.id, entryId), eq(financeEntries.userId, user.userId)));

  revalidatePath('/personal/finances');
  revalidatePath('/');
}
