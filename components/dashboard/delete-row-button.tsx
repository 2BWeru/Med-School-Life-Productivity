'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

export function DeleteRowButton({ action }: { action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => action())}
      disabled={isPending}
      className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
