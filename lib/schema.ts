import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  pgEnum,
  uniqueIndex,
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
  'osce',
  'practical',
  'rotation_end',
]);

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subjects = pgTable('subjects', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6366f1'),
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

export const usersRelations = relations(users, ({ many }) => ({
  subjects: many(subjects),
  tasks: many(tasks),
  studySessions: many(studySessions),
  exams: many(exams),
  habits: many(habits),
  journalEntries: many(journalEntries),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  tasks: many(tasks),
  studySessions: many(studySessions),
  exams: many(exams),
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
