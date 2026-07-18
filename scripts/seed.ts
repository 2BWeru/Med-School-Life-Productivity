import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../lib/schema';

const DEFAULT_SUBJECTS = [
  { name: 'Anatomy', emoji: '🦴', color: '#ef4444' },
  { name: 'Physiology', emoji: '🫁', color: '#f97316' },
  { name: 'Biochemistry', emoji: '🧪', color: '#eab308' },
  { name: 'Pharmacology', emoji: '💊', color: '#22c55e' },
  { name: 'Pathology', emoji: '🔬', color: '#06b6d4' },
  { name: 'Microbiology', emoji: '🦠', color: '#3b82f6' },
  { name: 'Clinical Rotations', emoji: '🏥', color: '#8b5cf6' },
];

const DEFAULT_HABITS = [
  { name: 'Slept 7+ hours', color: '#6366f1' },
  { name: 'Exercised / moved', color: '#22c55e' },
  { name: 'Drank enough water', color: '#06b6d4' },
  { name: 'Studied focused block', color: '#f97316' },
];

const YEAR_THEMES = [
  {
    yearNumber: 1,
    theme: 'Planting the Seeds',
    quote: "I don't have to know everything. I just have to grow every day.",
    status: 'current' as const,
  },
  {
    yearNumber: 2,
    theme: 'Building Momentum',
    quote: 'Confidence comes from preparation.',
    status: 'upcoming' as const,
  },
  {
    yearNumber: 3,
    theme: 'Climbing Higher',
    quote: 'Pressure creates diamonds.',
    status: 'upcoming' as const,
  },
  {
    yearNumber: 4,
    theme: 'Becoming a Doctor',
    quote: "Everything I've done has prepared me for this.",
    status: 'upcoming' as const,
  },
];

const YEAR1_SEMESTER1_CHECKLIST: { category: (typeof schema.checklistCategoryEnum.enumValues)[number]; label: string }[] = [
  { category: 'academics', label: 'Build a strong GPA (aim for top 20%)' },
  { category: 'academics', label: 'Start using AnKing / Anki' },
  { category: 'academics', label: 'Learn medical literature searching (PubMed)' },
  { category: 'career', label: 'Join IFMSA' },
  { category: 'career', label: 'Join at least one medical student society' },
  { category: 'career', label: 'Create a LinkedIn profile' },
  { category: 'career', label: 'Create your medical CV' },
  { category: 'volunteering', label: 'Community health outreach' },
  { category: 'volunteering', label: 'Blood donation drives' },
  { category: 'volunteering', label: 'Health education campaigns' },
];

const YEAR1_SEMESTER2_CHECKLIST: { category: (typeof schema.checklistCategoryEnum.enumValues)[number]; label: string }[] = [
  { category: 'research', label: 'Find a faculty mentor' },
  { category: 'research', label: 'Join one research project' },
  { category: 'research', label: 'Learn statistics (SPSS/R basics)' },
  { category: 'certifications', label: 'BLS certification' },
  { category: 'conferences', label: 'Attend one student medical conference' },
  { category: 'summer', label: 'Apply: IFMSA Research Exchange (SCORE) — top priority' },
  { category: 'summer', label: 'Backup: University-funded summer research' },
  { category: 'summer', label: 'Backup: Local hospital research assistant' },
];

const VISION_MILESTONES = [
  { key: 'md_degree', label: 'MD Degree', emoji: '🎓' },
  { key: 'step1', label: 'USMLE Step 1', emoji: '📚' },
  { key: 'step2ck', label: 'USMLE Step 2 CK', emoji: '📚' },
  { key: 'research', label: 'Research', emoji: '🔬' },
  { key: 'intl_exchange', label: 'International Exchange', emoji: '🌍' },
  { key: 'ph_license', label: 'Philippine Licensure', emoji: '📝' },
  { key: 'nzrex', label: 'NZREX', emoji: '🇳🇿' },
  { key: 'pgy1', label: 'PGY1 House Officer', emoji: '🏥' },
];

const VISION_TIMELINE = [
  { key: 'kenya', label: 'Kenya', emoji: '🇰🇪', stage: 'completed' as const },
  { key: 'gullas', label: 'Gullas College · Year 1', emoji: '🏫', stage: 'started' as const },
  { key: 'step1', label: 'USMLE Step 1', emoji: '📚', stage: 'dream' as const },
  { key: 'clinical', label: 'Clinical Excellence', emoji: '🩺', stage: 'dream' as const },
  { key: 'research', label: 'Research', emoji: '🔬', stage: 'dream' as const },
  { key: 'intl_elective', label: 'International Elective', emoji: '✈️', stage: 'dream' as const },
  { key: 'graduate', label: 'Graduate MD', emoji: '🎓', stage: 'dream' as const },
  { key: 'ph_licensure', label: 'Philippine Licensure', emoji: '📝', stage: 'dream' as const },
  { key: 'nzrex', label: 'NZREX Clinical', emoji: '🇳🇿', stage: 'dream' as const },
  { key: 'pgy1', label: 'PGY1 House Officer', emoji: '🏥', stage: 'dream' as const },
  { key: 'dr_betty', label: 'Dr. Betty, New Zealand', emoji: '👩🏾‍⚕️', stage: 'dream' as const },
];

const ACHIEVEMENTS = [
  { key: 'passed_anatomy', label: 'Passed Anatomy', emoji: '🥇' },
  { key: 'first_research', label: 'First Research Project', emoji: '🔬' },
  { key: 'first_conference', label: 'First Conference', emoji: '🎤' },
  { key: 'white_coat', label: 'White Coat Ceremony', emoji: '🥼' },
  { key: 'first_exchange', label: 'First International Exchange', emoji: '✈️' },
  { key: 'passed_step1', label: 'Passed Step 1', emoji: '📚' },
  { key: 'passed_nzrex', label: 'Passed NZREX', emoji: '🇳🇿' },
  { key: 'dr_betty_nz', label: 'Dr. Betty, New Zealand', emoji: '👩🏾‍⚕️' },
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

  // ---------- Program years + Year 1 semesters ----------
  const existingYears = await db.query.programYears.findMany({
    where: eq(schema.programYears.userId, userId),
  });

  let year1Id: string;

  if (existingYears.length === 0) {
    const insertedYears = await db
      .insert(schema.programYears)
      .values(YEAR_THEMES.map((y) => ({ ...y, userId })))
      .returning();
    year1Id = insertedYears.find((y) => y.yearNumber === 1)!.id;
    console.log(`Seeded ${insertedYears.length} program years.`);
  } else {
    year1Id = existingYears.find((y) => y.yearNumber === 1)!.id;
  }

  const existingSemesters = await db.query.semesters.findMany({
    where: eq(schema.semesters.yearId, year1Id),
  });

  let sem1Id: string;

  if (existingSemesters.length === 0) {
    const insertedSemesters = await db
      .insert(schema.semesters)
      .values([
        { userId, yearId: year1Id, semesterNumber: 1, status: 'active' },
        { userId, yearId: year1Id, semesterNumber: 2, status: 'locked' },
      ])
      .returning();
    sem1Id = insertedSemesters.find((s) => s.semesterNumber === 1)!.id;

    await db.insert(schema.roadmapChecklistItems).values(
      YEAR1_SEMESTER1_CHECKLIST.map((item) => ({ ...item, userId, semesterId: sem1Id })),
    );
    const sem2Id = insertedSemesters.find((s) => s.semesterNumber === 2)!.id;
    await db.insert(schema.roadmapChecklistItems).values(
      YEAR1_SEMESTER2_CHECKLIST.map((item) => ({ ...item, userId, semesterId: sem2Id })),
    );
    console.log('Seeded Year 1 Semester 1 & 2 with roadmap checklist items.');
  } else {
    sem1Id = existingSemesters.find((s) => s.semesterNumber === 1)!.id;
  }

  // ---------- Subjects (linked to Year 1 Semester 1) ----------
  const existingSubjects = await db.query.subjects.findMany({
    where: eq(schema.subjects.userId, userId),
  });

  if (existingSubjects.length === 0) {
    await db.insert(schema.subjects).values(
      DEFAULT_SUBJECTS.map((s) => ({ ...s, userId, semesterId: sem1Id, weeklyHourGoal: 8 })),
    );
    console.log(`Seeded ${DEFAULT_SUBJECTS.length} default subjects.`);
  }

  // ---------- Vision board scaffolding ----------
  const existingMilestones = await db.query.visionMilestones.findMany({
    where: eq(schema.visionMilestones.userId, userId),
  });

  if (existingMilestones.length === 0) {
    await db.insert(schema.visionMilestones).values(
      VISION_MILESTONES.map((m, i) => ({ ...m, userId, sortOrder: i })),
    );
    console.log(`Seeded ${VISION_MILESTONES.length} vision milestones.`);
  }

  const existingTimeline = await db.query.visionTimelineStages.findMany({
    where: eq(schema.visionTimelineStages.userId, userId),
  });

  if (existingTimeline.length === 0) {
    await db.insert(schema.visionTimelineStages).values(
      VISION_TIMELINE.map((t, i) => ({ ...t, userId, sortOrder: i })),
    );
    console.log(`Seeded ${VISION_TIMELINE.length} vision timeline stages.`);
  }

  const existingAchievements = await db.query.achievements.findMany({
    where: eq(schema.achievements.userId, userId),
  });

  if (existingAchievements.length === 0) {
    await db.insert(schema.achievements).values(ACHIEVEMENTS.map((a) => ({ ...a, userId })));
    console.log(`Seeded ${ACHIEVEMENTS.length} achievements (all locked).`);
  }

  // ---------- Habits ----------
  const existingHabits = await db.query.habits.findMany({
    where: eq(schema.habits.userId, userId),
  });

  if (existingHabits.length === 0) {
    await db.insert(schema.habits).values(DEFAULT_HABITS.map((h) => ({ ...h, userId })));
    console.log(`Seeded ${DEFAULT_HABITS.length} default habits.`);
  }

  console.log('Seed complete. You can now log in with your password.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
