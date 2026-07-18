import { and, asc, eq, gte } from 'drizzle-orm';
import { isToday } from 'date-fns';
import { db } from './db';
import { subjects, timetableEntries, exams, assignments, lectures } from './schema';
import { getActiveSemester } from './semester-helpers';

export async function getMedSchoolGlance(userId: string) {
  const semester = await getActiveSemester(userId);
  const now = new Date();
  const dayOfWeek = now.getDay();

  const [semesterSubjects, todaysClasses, upcomingExams, upcomingSgdAssignments, allLectures] =
    await Promise.all([
      semester
        ? db.query.subjects.findMany({ where: eq(subjects.semesterId, semester.id) })
        : Promise.resolve([]),
      semester
        ? db.query.timetableEntries.findMany({
            where: and(
              eq(timetableEntries.semesterId, semester.id),
              eq(timetableEntries.dayOfWeek, dayOfWeek),
            ),
            with: { subject: true },
          })
        : Promise.resolve([]),
      db.query.exams.findMany({
        where: and(eq(exams.userId, userId), gte(exams.examDate, now)),
        orderBy: [asc(exams.examDate)],
      }),
      semester
        ? db.query.assignments.findMany({
            where: and(
              eq(assignments.semesterId, semester.id),
              eq(assignments.type, 'sgd'),
              gte(assignments.dueDate, now),
            ),
            orderBy: [asc(assignments.dueDate)],
          })
        : Promise.resolve([]),
      db.query.lectures.findMany({ where: eq(lectures.userId, userId) }),
    ]);

  const quizzesToday = upcomingExams.filter((e) => e.examType === 'quiz' && isToday(e.examDate));
  const nextExam = upcomingExams.find((e) => e.examType === 'exam') ?? null;
  const nextCat = upcomingExams.find((e) => e.examType === 'cat') ?? null;
  const nextMainExam = upcomingExams.find((e) => e.examType === 'main_exam') ?? null;
  const nextSgd = upcomingSgdAssignments[0] ?? null;

  return {
    semester,
    semesterSubjects,
    todaysClasses,
    quizzesToday,
    nextExam,
    nextCat,
    nextMainExam,
    nextSgd,
    allLectures,
  };
}
