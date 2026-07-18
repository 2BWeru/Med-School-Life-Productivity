'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { shuffleTodayPlan } from './actions';

export function ShuffleButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => shuffleTodayPlan())}
    >
      🔀 {isPending ? 'Shuffling...' : "Shuffle today's plan"}
    </Button>
  );
}
