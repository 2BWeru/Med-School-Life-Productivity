import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  visionMilestones,
  visionTimelineStages,
  programYears,
  achievements,
  semesters,
} from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { cn } from '@/lib/utils';
import { PrintButton } from '../print-button';

export const dynamic = 'force-dynamic';

const STAGE_STYLES: Record<string, string> = {
  completed: 'bg-maroon border-maroon text-maroon-foreground',
  started: 'bg-primary border-primary text-primary-foreground ring-4 ring-secondary',
  planning: 'bg-card-tint border-border text-muted-foreground',
  dream: 'bg-card-tint border-border text-muted-foreground opacity-70',
};

const STAGE_LABEL: Record<string, string> = {
  completed: 'Done',
  started: 'In progress',
  planning: 'Planning',
  dream: 'Dream',
};

const YEAR_EMOJI = ['🌱', '🚀', '🏔️', '🌟'];

export default async function VisionBoardPage() {
  const user = await requireUser();

  const [milestones, timeline, years, badges] = await Promise.all([
    db.query.visionMilestones.findMany({
      where: eq(visionMilestones.userId, user.userId),
      orderBy: [asc(visionMilestones.sortOrder)],
    }),
    db.query.visionTimelineStages.findMany({
      where: eq(visionTimelineStages.userId, user.userId),
      orderBy: [asc(visionTimelineStages.sortOrder)],
    }),
    db.query.programYears.findMany({
      where: eq(programYears.userId, user.userId),
      orderBy: [asc(programYears.yearNumber)],
    }),
    db.query.achievements.findMany({ where: eq(achievements.userId, user.userId) }),
  ]);

  const yearsWithSemesterFlag = await Promise.all(
    years.map(async (y) => {
      const sems = await db.query.semesters.findMany({ where: eq(semesters.yearId, y.id) });
      return { ...y, hasSemesters: sems.length > 0 };
    }),
  );

  return (
    <div className="flex flex-col gap-8 print:gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-maroon to-plum p-8 text-white shadow-sm print:text-black print:shadow-none">
        <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
          🇳🇿 The road to New Zealand
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight">
          Becoming Dr. {user.name}
        </h1>
        <p className="mt-2 max-w-md text-sm font-semibold text-white/85">
          &quot;Small, consistent steps today build the doctor I&apos;ll become tomorrow.&quot;
        </p>
        <div className="mt-4 print:hidden">
          <PrintButton />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-maroon" /> Overall progress
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-[13px] font-bold">
                {m.emoji} {m.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-card-tint">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-maroon"
                  style={{ width: `${m.progressPct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-extrabold tabular-nums text-muted-foreground">
                {m.progressPct}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Vision timeline
        </h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-3 pt-1">
          {timeline.map((stage, i) => (
            <div key={stage.id} className="flex shrink-0 items-center">
              <div className="flex w-24 flex-col items-center gap-1.5 text-center">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl',
                    STAGE_STYLES[stage.stage],
                  )}
                >
                  {stage.emoji}
                </div>
                <span className="text-[10.5px] font-bold leading-tight">{stage.label}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  {STAGE_LABEL[stage.stage]}
                </span>
              </div>
              {i < timeline.length - 1 ? (
                <span className="mx-0.5 mb-5 shrink-0 text-sm text-border">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-plum" /> Four-year roadmap
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {yearsWithSemesterFlag.map((y, i) => (
            <div
              key={y.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="text-xl">{YEAR_EMOJI[i] ?? '⭐'}</span>
              <h4 className="text-sm font-extrabold">
                Year {y.yearNumber} — {y.theme}
              </h4>
              <p className="text-xs italic text-muted-foreground">&quot;{y.quote}&quot;</p>
              <span
                className={cn(
                  'self-start rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold',
                  y.status === 'current' && 'bg-secondary text-secondary-foreground',
                  y.status === 'complete' && 'bg-good/15 text-good',
                  y.status === 'upcoming' && 'bg-card-tint text-muted-foreground',
                )}
              >
                {y.status === 'current' ? 'Just starting ⭐' : y.status === 'complete' ? 'Completed ⭐' : 'Upcoming'}
              </span>
              {y.hasSemesters ? (
                <Link href="/med-school/semester" className="text-[11.5px] font-extrabold text-primary">
                  📋 View full checklist →
                </Link>
              ) : (
                <span className="text-[11.5px] font-bold text-muted-foreground">
                  📋 Unlocks when you get here
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs italic text-muted-foreground">
          Every checklist item from your roadmap lives inside that year&apos;s semester templates
          — nothing is dropped, the vision board just shows the skimmable version.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Achievement wall
        </h2>
        <div className="flex flex-wrap gap-3.5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={cn(
                'flex w-20 flex-col items-center gap-1 text-center text-[10.5px] font-bold text-muted-foreground',
                !b.unlocked && 'opacity-60',
              )}
            >
              <div
                className={cn(
                  'flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 text-2xl',
                  b.unlocked
                    ? 'border-gold bg-gold-soft'
                    : 'border-border bg-card-tint grayscale',
                )}
              >
                {b.emoji}
              </div>
              {b.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
