import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../lib/schema';

const DEFAULT_SUBJECTS = [
  { name: 'Anatomy', color: '#ef4444' },
  { name: 'Physiology', color: '#f97316' },
  { name: 'Biochemistry', color: '#eab308' },
  { name: 'Pharmacology', color: '#22c55e' },
  { name: 'Pathology', color: '#06b6d4' },
  { name: 'Microbiology', color: '#3b82f6' },
  { name: 'Clinical Rotations', color: '#8b5cf6' },
];

const DEFAULT_HABITS = [
  { name: 'Slept 7+ hours', color: '#6366f1' },
  { name: 'Exercised / moved', color: '#22c55e' },
  { name: 'Drank enough water', color: '#06b6d4' },
  { name: 'Studied focused block', color: '#f97316' },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  }

  const email = process.env.SEED_USER_EMAIL;
  const name = process.env.SEED_USER_NAME ?? 'Student';
  const password = process.env.SEED_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_USER_EMAIL and SEED_USER_PASSWORD must be set in your .env');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

  let userId: string;

  if (existing) {
    await db
      .update(schema.users)
      .set({ passwordHash, name })
      .where(eq(schema.users.id, existing.id));
    userId = existing.id;
    console.log(`Updated existing user ${email}.`);
  } else {
    const [created] = await db
      .insert(schema.users)
      .values({ email, name, passwordHash })
      .returning();
    userId = created.id;
    console.log(`Created user ${email}.`);
  }

  const existingSubjects = await db.query.subjects.findMany({
    where: eq(schema.subjects.userId, userId),
  });

  if (existingSubjects.length === 0) {
    await db.insert(schema.subjects).values(
      DEFAULT_SUBJECTS.map((s) => ({ ...s, userId })),
    );
    console.log(`Seeded ${DEFAULT_SUBJECTS.length} default subjects.`);
  }

  const existingHabits = await db.query.habits.findMany({
    where: eq(schema.habits.userId, userId),
  });

  if (existingHabits.length === 0) {
    await db.insert(schema.habits).values(DEFAULT_HABITS.map((h) => ({ ...h, userId })));
    console.log(`Seeded ${DEFAULT_HABITS.length} default habits.`);
  }

  console.log('Seed complete. You can now log in with your email/password.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
