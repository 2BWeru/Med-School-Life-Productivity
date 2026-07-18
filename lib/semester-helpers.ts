import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import { programYears, semesters } from './schema';

export async function getActiveSemester(userId: string) {
  const currentYear = await db.query.programYears.findFirst({
    where: eq(programYears.userId, userId),
    orderBy: [asc(programYears.yearNumber)],
  });
  if (!currentYear) return null;

  const yearSemesters = await db.query.semesters.findMany({
    where: eq(semesters.yearId, currentYear.id),
    orderBy: [asc(semesters.semesterNumber)],
  });

  return yearSemesters.find((s) => s.status === 'active') ?? yearSemesters[0] ?? null;
}
