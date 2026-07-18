'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { getActiveSemester } from '@/lib/semester-helpers';
import { maybeUnlockAchievement } from '@/lib/gamification';

const TYPES = ['exchange', 'scholarship', 'conference', 'internship', 'other'] as const;
const STATUSES = ['planned', 'applied', 'accepted', 'rejected'] as const;

function asEnum<T extends readonly string[]>(values: T, value: FormDataEntryValue | null): T[number] {
  const v = String(value ?? '');
  return (values as readonly string[]).includes(v) ? (v as T[number]) : (values[0] as T[number]);
}

export async function createApplication(formData: FormData) {
  const user = await requireUser();
  const semester = await getActiveSemester(user.userId);

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const type = asEnum(TYPES, formData.get('type'));
  const status = asEnum(STATUSES, formData.get('status'));
  const deadlineRaw = String(formData.get('deadline') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(applications).values({
    userId: user.userId,
    semesterId: semester?.id ?? null,
    name,
    type,
    status,
    deadline: deadlineRaw || null,
    notes,
  });

  if (status === 'accepted' && type === 'exchange') {
    await maybeUnlockAchievement(user.userId, 'first_exchange');
  }

  revalidatePath('/med-school/semester/applications');
  revalidatePath('/med-school/semester');
}

export async function cycleApplicationStatus(applicationId: string) {
  const user = await requireUser();

  const application = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), eq(applications.userId, user.userId)),
  });
  if (!application) return;

  const currentIndex = STATUSES.indexOf(application.status);
  const next = STATUSES[(currentIndex + 1) % STATUSES.length];

  await db.update(applications).set({ status: next }).where(eq(applications.id, applicationId));

  if (next === 'accepted' && application.type === 'exchange') {
    await maybeUnlockAchievement(user.userId, 'first_exchange');
  }

  revalidatePath('/med-school/semester/applications');
  revalidatePath('/med-school/semester');
}

export async function deleteApplication(applicationId: string) {
  const user = await requireUser();
  await db
    .delete(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, user.userId)));

  revalidatePath('/med-school/semester/applications');
  revalidatePath('/med-school/semester');
}
