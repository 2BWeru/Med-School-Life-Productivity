# Jolly 🎀

Betty's whole life, sorted — a bubbly, ADHD-friendly personal dashboard covering **Med School**,
**Personal Life**, and **Work**. Built with Next.js 14 (App Router), Drizzle ORM, and Neon
Postgres, deployed on Vercel.

## Features

### Med School
- **Today's Lectures** — a daily glance card (classes, quizzes, next exam/CAT/main exam,
  SGD assignments due) plus subject cards for the current semester
- **Subject / lecture detail** — the why-it-matters + roadmap-connections entry point, quick
  links (lecture video, NotebookLM, practice questions, mnemonics), an after-class recall zone,
  a 4-item checklist that pays out gold stars, and a placeholder AI Study Kit (auto-generated
  Anki cards / NotebookLM prompts / practice questions — needs an Anthropic API key to go live)
- **Vision Board** — the 4-year North Star roadmap: milestone progress bars, a stage-by-stage
  timeline (Kenya → ... → Dr. Betty in NZ), yearly theme cards, and an achievement wall
- **Semester Planner** — Year 1 ships with both Semester 1 and 2 pre-built from the real roadmap;
  Semester 2 stays locked until Semester 1 is marked complete **and** 80% of its gold stars are
  earned. Includes the full checklist (grouped by Academics/Career/Volunteering/Research/etc.)
  and 8 submission areas: timetable, lecture notes, past exam questions, quiz results, exam
  results, applications, clubs, assignments
- **Study Tracker** and **Exams & CATs/Main Exams** — the original subject/session/exam tracking

### Personal Life
Deliberately minimal on the dashboard (one line per area) with a full page behind each:
Birthdays & Trips, Meals (food-preference rotation with a shuffle button), Gym Progress, Visa
Tracker (documents/expiry/fees for Gullas College of Medicine), Home & Finances (rent/utilities
with a monthly total), Public Speaking (daily topic generator + a video log).

### Work
A placeholder that's ready to fill in once there's an active EVA client.

### Cross-cutting
- **Push notifications** — an installable PWA with real web push (self-hosted VAPID keys, no
  third-party account needed)
- **Gold stars & streaks** — checklist items, lecture progress, gym logs, and speaking practice
  all pay out stars; a handful of achievements auto-unlock (first research checklist item, first
  conference checklist item, first accepted exchange application) — the rest are seeded locked,
  ready for future features (USMLE/NZREX tracking) to unlock them
- **Tasks / Habits / Journal** — the original general-purpose to-do list, 7-day habit grid, and
  mood journal, tucked under a "More" nav group

Auth is a single shared password (no username/email field) — session stored in a signed,
httpOnly JWT cookie for 30 days. There's no public sign-up, since this is meant for one person.
Anyone with the password can access everything, so treat it like any other credential.

## Tech stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Drizzle ORM with the Neon HTTP driver (`@neondatabase/serverless`)
- Server Actions for all mutations (no separate REST API layer)
- Auth via signed JWT cookies (`jose`) + `bcryptjs` for password hashing
- Web Push (`web-push`) for installable-PWA notifications

## 1. Create a Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Copy the connection string from the Neon dashboard (**Connection Details**). It looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=                # your Neon connection string
SESSION_SECRET=              # generate with: openssl rand -base64 32
SEED_USER_EMAIL=             # internal label only — not used to log in, any value is fine
SEED_USER_NAME=               # your name, shown in the dashboard
SEED_USER_PASSWORD=          # the single password you'll use to log in (only used by the seed script)

VAPID_PUBLIC_KEY=            # generate with: node -e "console.log(require('web-push').generateVAPIDKeys())"
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY= # same value as VAPID_PUBLIC_KEY
```

Push notifications are optional — everything else works fine without the VAPID vars, the
"Turn on reminders" prompt just won't do anything until they're set.

## 3. Install dependencies, run migrations, and seed your account

```bash
npm install
npm run db:generate   # generate SQL migrations from lib/schema.ts (only needed after schema changes)
npm run db:migrate    # apply migrations to your Neon database
npm run db:seed       # creates your login, Year 1 roadmap (Sem 1 + 2), vision board, subjects, habits
```

`db:seed` is idempotent — re-running it updates your password/name rather than creating
duplicates, and only seeds default subjects/habits/roadmap data if you don't have any yet.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`, and log in with `SEED_USER_PASSWORD` from your `.env`.

## 5. Deploy to Vercel

1. Push this repo to GitHub (or import directly from your Git provider in Vercel).
2. In Vercel, **New Project** → import this repo. Confirm the **Framework Preset** is set to
   **Next.js** and **Root Directory** is left blank.
3. Add the same environment variables from your `.env` (`DATABASE_URL`, `SESSION_SECRET`, and
   the `VAPID_*` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ones if you want push notifications) in
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

## Known gaps / fast-follows

A few things from the brief are intentionally stubbed rather than half-built:

- **AI Study Kit** (auto-generated Anki cards / NotebookLM prompts from lecture recall) — the UI
  is in place on the subject/lecture detail page, but needs an Anthropic API key wired in to
  actually generate anything.
- **Google Drive / Calendar / Calendly integration** — currently shown as static labels on the
  lecture detail page. Real OAuth integration needs a Google Cloud project + consent screen
  set up first.
- **Public speaking video recording** — currently a paste-a-link log rather than in-browser
  recording + storage, since that needs Vercel Blob storage enabled on the project.
- **Achievement auto-unlocking** — only 3 of the 8 seeded achievements have real triggers today
  (first research/conference checklist item, first accepted exchange application). The rest
  (Passed Step 1, Passed NZREX, White Coat Ceremony, Dr. Betty NZ) need dedicated
  USMLE/NZREX/graduation tracking features to unlock automatically.

## Project structure

```
app/
  (dashboard)/
    page.tsx                    # home — condensed Med School + Personal Life + Work overview
    med-school/
      page.tsx                  # Today's Lectures — glance card + subject grid
      vision-board/             # 4-year roadmap, milestones, timeline, achievements
      semester/                 # active semester: checklist, submissions grid, subjects
        timetable/ lecture-notes/ past-exams/ quiz-results/
        exam-results/ applications/ clubs/ assignments/
      subjects/[subjectId]/     # lecture detail: why/roadmap/recall/checklist/AI kit
    personal/
      birthdays/ meals/ gym/ visa/ finances/ speaking/
    work/                       # placeholder
    study/ exams/               # original subject/session/exam tracking
    tasks/ habits/ journal/     # general-purpose, tucked under "More"
  login/                       # login page + server action
lib/
  schema.ts                    # Drizzle table + relation definitions
  db.ts                        # Neon HTTP driver + Drizzle client
  auth.ts                      # JWT session cookie helpers
  session-helpers.ts           # requireUser() for pages/actions
  semester-helpers.ts          # getActiveSemester()
  med-school-glance.ts         # shared "today at a glance" data for home + Med School pages
  gamification.ts              # awardStars / touchStreakForToday / maybeUnlockAchievement
  push.ts                      # sendPushToUser() via web-push
middleware.ts                  # route protection (excludes PWA static assets)
public/
  manifest.json sw.js icon.svg # PWA + push notification assets
scripts/
  migrate.ts                   # runs drizzle migrations against Neon
  seed.ts                      # creates your user, roadmap, subjects, habits
```

## Notes

- All data is scoped to your single seeded user via `userId` foreign keys — there is no
  multi-tenant support, by design.
- Every mutation runs through a Next.js Server Action, colocated in an `actions.ts` file next
  to the page that uses it.
