import { format, parseISO } from 'date-fns';

export function WeeklyChart({ days }: { days: { date: string; minutes: number }[] }) {
  const maxMinutes = Math.max(60, ...days.map((d) => d.minutes));

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3">
      {days.map((d) => {
        const heightPct = Math.max(4, Math.round((d.minutes / maxMinutes) * 100));
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t-md bg-primary/80 transition-all"
                style={{ height: `${heightPct}%` }}
                title={`${Math.round(d.minutes)} min`}
              />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              {format(parseISO(d.date), 'EEE')}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {d.minutes >= 60 ? `${(d.minutes / 60).toFixed(1)}h` : `${d.minutes}m`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
