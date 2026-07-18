'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSessionCookie } from '@/lib/auth';

export type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');
  const from = String(formData.get('from') ?? '/');

  if (!password) {
    return { error: 'Enter your password.' };
  }

  const user = await db.query.users.findFirst();

  if (!user) {
    return { error: 'No account is set up yet.' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: 'Incorrect password.' };
  }

  await createSessionCookie({ userId: user.id, email: user.email, name: user.name });

  redirect(from && from.startsWith('/') ? from : '/');
}
