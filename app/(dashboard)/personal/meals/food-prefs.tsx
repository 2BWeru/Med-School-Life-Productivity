'use client';

import { useRef, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addFoodPreference, deleteFoodPreference } from './actions';

type Pref = { id: string; name: string };

export function FoodPrefs({ prefs }: { prefs: Pref[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {
    await addFoodPreference(formData);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {prefs.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1.5 pl-3.5 pr-1.5 text-xs font-bold text-secondary-foreground"
          >
            {p.name}
            <button
              onClick={() => startTransition(() => deleteFoodPreference(p.id))}
              disabled={isPending}
              className="rounded-full p-0.5 hover:bg-white/40"
              aria-label={`Remove ${p.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {prefs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No foods added yet — add some below.</p>
        ) : null}
      </div>
      <form ref={formRef} action={handleAction} className="flex gap-2">
        <Input name="name" placeholder="e.g. Adobo" className="max-w-xs" required />
        <Button type="submit" variant="outline">
          + Add a food
        </Button>
      </form>
    </div>
  );
}
