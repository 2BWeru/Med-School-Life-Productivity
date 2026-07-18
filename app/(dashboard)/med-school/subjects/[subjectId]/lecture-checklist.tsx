'use client';

import { useState, useTransition } from 'react';
import { Check, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toggleLectureFlag, saveRecallNotes } from './actions';

type Flag = 'whyReviewed' | 'lectureWatched' | 'questionsDone' | 'recallDone';

const FLAG_LABELS: Record<Flag, string> = {
  whyReviewed: 'Read the why & roadmap',
  lectureWatched: 'Watched the lecture',
  questionsDone: 'Did practice questions',
  recallDone: 'Completed after-class recall',
};

export function LectureChecklist({
  lectureId,
  subjectName,
  flags,
  recallNotes,
}: {
  lectureId: string;
  subjectName: string;
  flags: Record<Flag, boolean>;
  recallNotes: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(recallNotes);
  const [saved, setSaved] = useState(true);

  const allDone = (Object.keys(FLAG_LABELS) as Flag[]).every((f) => flags[f]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4">
        <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
          🎙️ After-class recall
        </span>
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="Type or talk through what you understood after class..."
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isPending || saved}
            onClick={() =>
              startTransition(async () => {
                await saveRecallNotes(lectureId, notes);
                setSaved(true);
              })
            }
          >
            {saved ? 'Saved' : 'Save recall'}
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-extrabold text-primary-foreground">
            <Mic className="h-3.5 w-3.5" /> Record voice note
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-plum-soft to-secondary p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-maroon-foreground">
            ✨ AI Study Kit{' '}
            <span className="ml-1 rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal">
              Not connected yet
            </span>
          </span>
        </div>
        <p className="mt-2 text-xs font-semibold text-maroon-foreground/80">
          Once an AI provider is connected, finishing your recall here will auto-generate
          ready-to-copy Anki cards, a NotebookLM prompt, and practice questions for {subjectName}.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {(Object.keys(FLAG_LABELS) as Flag[]).map((flag) => (
          <button
            key={flag}
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => toggleLectureFlag(lectureId, flag))}
            className="flex items-center gap-2.5 text-left text-[13px] font-semibold disabled:opacity-60"
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-border',
                flags[flag] && 'border-good bg-good text-white',
              )}
            >
              {flags[flag] ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className={cn(flags[flag] && 'text-muted-foreground line-through')}>
              {FLAG_LABELS[flag]}
            </span>
          </button>
        ))}
        <span className="text-xs font-semibold text-muted-foreground">
          {allDone
            ? `Nice — you've earned today's gold star for ${subjectName} ⭐`
            : `Finish all 4 to earn today's gold star for ${subjectName} ⭐`}
        </span>
      </div>
    </div>
  );
}
