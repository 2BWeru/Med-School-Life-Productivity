'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { visaProfile, visaDocuments } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';

export async function saveVisaProfile(formData: FormData) {
  const user = await requireUser();

  const schoolName = String(formData.get('schoolName') ?? '').trim() || 'Gullas College of Medicine';
  const country = String(formData.get('country') ?? '').trim() || 'Philippines';
  const visaType = String(formData.get('visaType') ?? '').trim() || null;
  const renewalDateRaw = String(formData.get('renewalDate') ?? '');
  const feeAmountRaw = String(formData.get('feeAmount') ?? '');
  const feeCurrency = String(formData.get('feeCurrency') ?? '').trim() || 'USD';
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db
    .insert(visaProfile)
    .values({
      userId: user.userId,
      schoolName,
      country,
      visaType,
      renewalDate: renewalDateRaw || null,
      feeAmount: feeAmountRaw || null,
      feeCurrency,
      notes,
    })
    .onConflictDoUpdate({
      target: visaProfile.userId,
      set: { schoolName, country, visaType, renewalDate: renewalDateRaw || null, feeAmount: feeAmountRaw || null, feeCurrency, notes },
    });

  revalidatePath('/personal/visa');
  revalidatePath('/');
}

const DOC_STATUS_CYCLE = ['pending', 'ready', 'submitted'] as const;

export async function addVisaDocument(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  const dueDateRaw = String(formData.get('dueDate') ?? '');

  await db.insert(visaDocuments).values({ userId: user.userId, name, dueDate: dueDateRaw || null });

  revalidatePath('/personal/visa');
  revalidatePath('/');
}

export async function cycleVisaDocumentStatus(docId: string) {
  const user = await requireUser();

  const doc = await db.query.visaDocuments.findFirst({
    where: and(eq(visaDocuments.id, docId), eq(visaDocuments.userId, user.userId)),
  });
  if (!doc) return;

  const currentIndex = DOC_STATUS_CYCLE.indexOf(doc.status);
  const next = DOC_STATUS_CYCLE[(currentIndex + 1) % DOC_STATUS_CYCLE.length];

  await db.update(visaDocuments).set({ status: next }).where(eq(visaDocuments.id, docId));

  revalidatePath('/personal/visa');
  revalidatePath('/');
}

export async function deleteVisaDocument(docId: string) {
  const user = await requireUser();
  await db
    .delete(visaDocuments)
    .where(and(eq(visaDocuments.id, docId), eq(visaDocuments.userId, user.userId)));

  revalidatePath('/personal/visa');
  revalidatePath('/');
}
