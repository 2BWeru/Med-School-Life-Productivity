# Med School Life Productivity

A personal Med School + Life Productivity dashboard. Built with Next.js 14 (App Router),
Drizzle ORM, and Neon Postgres, deployed on Vercel.

## Features

- **Overview dashboard** — open tasks, next exam countdown, weekly study hours, today's habits
- **Tasks** — kanban-style board (To Do / In Progress / Done) across academic, clinical,
  personal, and health categories, with priority and due dates
- **Study tracker** — manage subjects/rotations, log study sessions, see a 7-day study chart
- **Exams & deadlines** — countdowns for exams, quizzes, OSCEs, practicals, and rotation-end dates
- **Habits** — a 7-day habit grid you can tap to check off
- **Journal** — a daily mood + reflection log

Auth is a simple single-user email/password login (session stored in a signed, httpOnly JWT
cookie) — there's no public sign-up, since this is meant for one person.

## Tech stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Drizzle ORM with the Neon HTTP driver (`@neondatabase/serverless`)
- Server Actions for all mutations (no separate REST API layer)
- Auth via signed JWT cookies (`jose`) + `bcryptjs` for password hashing

## 1. Create a Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Copy the connection string from the Neon dashboard (**Connection Details**). It looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=          # your Neon connection string
SESSION_SECRET=        # generate with: openssl rand -base64 32
SEED_USER_EMAIL=       # the email you'll log in with
SEED_USER_NAME=        # your name, shown in the dashboard
SEED_USER_PASSWORD=    # the password you'll log in with (only used by the seed script)
```

## 3. Install dependencies, run migrations, and seed your account

```bash
npm install
npm run db:generate   # generate SQL migrations from lib/schema.ts (only needed after schema changes)
npm run db:migrate    # apply migrations to your Neon database
npm run db:seed       # creates your login + default med-school subjects and starter habits
```

`db:seed` is idempotent — re-running it updates your password/name rather than creating
duplicates, and only seeds default subjects/habits if you don't have any yet.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`, and log in with the email/password from your `.env`.

## 5. Deploy to Vercel

1. Push this repo to GitHub (or import directly from your Git provider in Vercel).
2. In Vercel, **New Project** → import this repo.
3. Add the same environment variables from your `.env` (`DATABASE_URL`, `SESSION_SECRET`) in
   **Project Settings → Environment Variables**. You don't need `SEED_USER_*` in Vercel — those
   are only used by the local seed script.
4. Deploy. Vercel will run `next build` automatically.
5. Before (or after) your first deploy, run the migration + seed scripts once, pointed at your
   Neon database, from your local machine (they use the same `DATABASE_URL`):
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

That's it — your dashboard is live and backed by Neon Postgres.

## Project structure

```
app/
  (dashboard)/        # protected routes — sidebar layout, redirects to /login if unauthenticated
    page.tsx           # overview
    tasks/             # kanban task board
    study/              # subjects + study session log + weekly chart
    exams/              # exams/deadlines with countdowns
    habits/             # 7-day habit grid
    journal/            # daily mood + notes
  login/               # login page + server action
lib/
  schema.ts            # Drizzle table + relation definitions
  db.ts                # Neon HTTP driver + Drizzle client
  auth.ts              # JWT session cookie helpers
  session-helpers.ts   # requireUser() for pages/actions
middleware.ts          # route protection
scripts/
  migrate.ts           # runs drizzle migrations against Neon
  seed.ts               # creates your user + default subjects/habits
```

## Notes

- All data is scoped to your single seeded user via `userId` foreign keys — there is no
  multi-tenant support, by design.
- Every mutation runs through a Next.js Server Action, colocated in an `actions.ts` file next
  to the page that uses it.
