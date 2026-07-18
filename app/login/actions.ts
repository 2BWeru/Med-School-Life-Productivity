'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { createSessionCookie } from '@/lib/auth';

export type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const from = String(formData.get('from') ?? '/');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: 'Invalid email or password.' };
  }

  await createSessionCookie({ userId: user.id, email: user.email, name: user.name });

  redirect(from && from.startsWith('/') ? from : '/');
}
