import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  boolean,
  numeric,
  pgEnum,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const taskCategoryEnum = pgEnum('task_category', [
  'academic',
  'clinical',
  'personal',
  'health',
]);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);
export const examTypeEnum = pgEnum('exam_type', [
  'exam',
  'quiz',
  'cat',
  'main_exam',
  'osce',
  'practical',
  'rotation_end',
]);
export const yearStatusEnum = pgEnum('year_status', ['upcoming', 'current', 'complete']);
export const semesterStatusEnum = pgEnum('semester_status', ['locked', 'active', 'complete']);
export const checklistCategoryEnum = pgEnum('checklist_category', [
  'academics',
  'career',
  'volunteering',
  'research',
  'certifications',
  'conferences',
  'summer',
]);
export const milestoneStageEnum = pgEnum('milestone_stage', [
  'dream',
  'planning',
  'started',
  'completed',
]);
export const assignmentTypeEnum = pgEnum('assignment_type', ['sgd', 'coursework', 'other']);
export const applicationTypeEnum = pgEnum('application_type', [
  'exchange',
  'scholarship',
  'conference',
  'internship',
  'other',
]);
export const applicationStatusEnum = pgEnum('application_status', [
  'planned',
  'applied',
  'accepted',
  'rejected',
]);
export const visaDocStatusEnum = pgEnum('visa_doc_status', ['pending', 'ready', 'submitted']);
export const financeCategoryEnum = pgEnum('finance_category', ['rent', 'utilities', 'other']);

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  goldStars: integer('gold_stars').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  lastStreakDate: date('last_streak_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subjects = pgTable('subjects', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id').references((): AnyPgColumn => semesters.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  emoji: text('emoji').notNull().default('📖'),
  color: text('color').notNull().default('#6366f1'),
  weeklyHourGoal: integer('weekly_hour_goal'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  category: taskCategoryEnum('category').notNull().default('academic'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  status: taskStatusEnum('status').notNull().default('todo'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const studySessions = pgTable('study_sessions', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  durationMinutes: integer('duration_minutes').notNull(),
  sessionDate: date('session_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exams = pgTable('exams', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  examType: examTypeEnum('exam_type').notNull().default('exam'),
  examDate: timestamp('exam_date', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const habits = pgTable('habits', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#22c55e'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const habitLogs = pgTable(
  'habit_logs',
  {
    id: id(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    logDate: date('log_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    habitDateUnique: uniqueIndex('habit_logs_habit_date_unique').on(table.habitId, table.logDate),
  }),
);

export const journalEntries = pgTable(
  'journal_entries',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    entryDate: date('entry_date').notNull(),
    mood: integer('mood').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userDateUnique: uniqueIndex('journal_entries_user_date_unique').on(
      table.userId,
      table.entryDate,
    ),
  }),
);

// ---------- Med School: Vision Board ----------

export const programYears = pgTable('program_years', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  yearNumber: integer('year_number').notNull(),
  theme: text('theme').notNull(),
  quote: text('quote').notNull(),
  status: yearStatusEnum('status').notNull().default('upcoming'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const semesters = pgTable('semesters', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  yearId: text('year_id')
    .notNull()
    .references(() => programYears.id, { onDelete: 'cascade' }),
  semesterNumber: integer('semester_number').notNull(),
  status: semesterStatusEnum('status').notNull().default('locked'),
  unlockThresholdPct: integer('unlock_threshold_pct').notNull().default(80),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roadmapChecklistItems = pgTable('roadmap_checklist_items', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  category: checklistCategoryEnum('category').notNull(),
  label: text('label').notNull(),
  done: boolean('done').notNull().default(false),
  starValue: integer('star_value').notNull().default(10),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const visionMilestones = pgTable('vision_milestones', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  label: text('label').notNull(),
  emoji: text('emoji').notNull().default('⭐'),
  progressPct: integer('progress_pct').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const visionTimelineStages = pgTable('vision_timeline_stages', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  label: text('label').notNull(),
  emoji: text('emoji').notNull(),
  stage: milestoneStageEnum('stage').notNull().default('dream'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const achievements = pgTable('achievements', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  label: text('label').notNull(),
  emoji: text('emoji').notNull(),
  unlocked: boolean('unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }),
});

export const starEvents = pgTable('star_events', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Med School: Semester submissions ----------

export const lectures = pgTable('lectures', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  lectureDate: date('lecture_date').notNull(),
  whyItMatters: text('why_it_matters'),
  roadmapConnections: text('roadmap_connections'),
  summary: text('summary'),
  mnemonics: text('mnemonics'),
  lectureUrl: text('lecture_url'),
  notebookLmPrompt: text('notebook_lm_prompt'),
  questionsUrl: text('questions_url'),
  whyReviewed: boolean('why_reviewed').notNull().default(false),
  lectureWatched: boolean('lecture_watched').notNull().default(false),
  questionsDone: boolean('questions_done').notNull().default(false),
  recallDone: boolean('recall_done').notNull().default(false),
  recallNotes: text('recall_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const timetableEntries = pgTable('timetable_entries', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  label: text('label').notNull().default('Lecture'),
});

export const assignments = pgTable('assignments', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  type: assignmentTypeEnum('type').notNull().default('coursework'),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  submitted: boolean('submitted').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lectureNotes = pgTable('lecture_notes', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pastExamQuestions = pgTable('past_exam_questions', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const quizResults = pgTable('quiz_results', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  score: integer('score'),
  maxScore: integer('max_score'),
  resultDate: date('result_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const examResults = pgTable('exam_results', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  score: integer('score'),
  maxScore: integer('max_score'),
  resultDate: date('result_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const applications = pgTable('applications', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id').references(() => semesters.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  type: applicationTypeEnum('type').notNull().default('other'),
  deadline: date('deadline'),
  status: applicationStatusEnum('status').notNull().default('planned'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const clubs = pgTable('clubs', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id').references(() => semesters.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  role: text('role'),
  joinedDate: date('joined_date'),
});

// ---------- Personal Life ----------

export const birthdays = pgTable('birthdays', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  month: integer('month').notNull(),
  day: integer('day').notNull(),
  notes: text('notes'),
});

export const foodPreferences = pgTable('food_preferences', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
});

export const mealPlans = pgTable(
  'meal_plans',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planDate: date('plan_date').notNull(),
    breakfast: text('breakfast'),
    lunch: text('lunch'),
    snack: text('snack'),
  },
  (table) => ({
    userDateUnique: uniqueIndex('meal_plans_user_date_unique').on(table.userId, table.planDate),
  }),
);

export const gymLogs = pgTable('gym_logs', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  logDate: date('log_date').notNull(),
  workoutType: text('workout_type').notNull(),
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const visaProfile = pgTable('visa_profile', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  schoolName: text('school_name').notNull().default('Gullas College of Medicine'),
  country: text('country').notNull().default('Philippines'),
  visaType: text('visa_type'),
  renewalDate: date('renewal_date'),
  feeAmount: numeric('fee_amount', { precision: 10, scale: 2 }),
  feeCurrency: text('fee_currency').notNull().default('USD'),
  notes: text('notes'),
});

export const visaDocuments = pgTable('visa_documents', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: visaDocStatusEnum('status').notNull().default('pending'),
  dueDate: date('due_date'),
});

export const financeEntries = pgTable('finance_entries', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  category: financeCategoryEnum('category').notNull().default('other'),
  label: text('label').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date'),
  paid: boolean('paid').notNull().default(false),
  paidDate: date('paid_date'),
});

export const speakingTopics = pgTable('speaking_topics', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  topicDate: date('topic_date').notNull(),
  topic: text('topic').notNull(),
  notes: text('notes'),
});

export const speakingVideos = pgTable('speaking_videos', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  topicId: text('topic_id').references(() => speakingTopics.id, { onDelete: 'set null' }),
  videoUrl: text('video_url').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  selfRating: integer('self_rating'),
  notes: text('notes'),
});

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    endpointUnique: uniqueIndex('push_subscriptions_endpoint_unique').on(table.endpoint),
  }),
);

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  subjects: many(subjects),
  tasks: many(tasks),
  studySessions: many(studySessions),
  exams: many(exams),
  habits: many(habits),
  journalEntries: many(journalEntries),
  programYears: many(programYears),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  tasks: many(tasks),
  studySessions: many(studySessions),
  exams: many(exams),
  lectures: many(lectures),
  semester: one(semesters, { fields: [subjects.semesterId], references: [semesters.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  subject: one(subjects, { fields: [tasks.subjectId], references: [subjects.id] }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  subject: one(subjects, { fields: [studySessions.subjectId], references: [subjects.id] }),
}));

export const examsRelations = relations(exams, ({ one }) => ({
  subject: one(subjects, { fields: [exams.subjectId], references: [subjects.id] }),
}));

export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, { fields: [habitLogs.habitId], references: [habits.id] }),
}));

export const programYearsRelations = relations(programYears, ({ many }) => ({
  semesters: many(semesters),
}));

export const semestersRelations = relations(semesters, ({ one, many }) => ({
  year: one(programYears, { fields: [semesters.yearId], references: [programYears.id] }),
  checklistItems: many(roadmapChecklistItems),
  subjects: many(subjects),
  timetableEntries: many(timetableEntries),
  assignments: many(assignments),
}));

export const roadmapChecklistItemsRelations = relations(roadmapChecklistItems, ({ one }) => ({
  semester: one(semesters, {
    fields: [roadmapChecklistItems.semesterId],
    references: [semesters.id],
  }),
}));

export const lecturesRelations = relations(lectures, ({ one }) => ({
  subject: one(subjects, { fields: [lectures.subjectId], references: [subjects.id] }),
}));

export const timetableEntriesRelations = relations(timetableEntries, ({ one }) => ({
  subject: one(subjects, { fields: [timetableEntries.subjectId], references: [subjects.id] }),
  semester: one(semesters, { fields: [timetableEntries.semesterId], references: [semesters.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  subject: one(subjects, { fields: [assignments.subjectId], references: [subjects.id] }),
  semester: one(semesters, { fields: [assignments.semesterId], references: [semesters.id] }),
}));

export const lectureNotesRelations = relations(lectureNotes, ({ one }) => ({
  subject: one(subjects, { fields: [lectureNotes.subjectId], references: [subjects.id] }),
}));

export const pastExamQuestionsRelations = relations(pastExamQuestions, ({ one }) => ({
  subject: one(subjects, { fields: [pastExamQuestions.subjectId], references: [subjects.id] }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  subject: one(subjects, { fields: [quizResults.subjectId], references: [subjects.id] }),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  subject: one(subjects, { fields: [examResults.subjectId], references: [subjects.id] }),
}));

export const speakingVideosRelations = relations(speakingVideos, ({ one }) => ({
  topic: one(speakingTopics, {
    fields: [speakingVideos.topicId],
    references: [speakingTopics.id],
  }),
}));
