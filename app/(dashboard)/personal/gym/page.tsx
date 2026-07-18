import { desc, eq } from 'drizzle-orm';
import { format, parseISO, subDays } from 'date-fns';
import { db } from '@/lib/db';
import { gymLogs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { GymForm } from './gym-form';
import { deleteGymLog } from './actions';

export const dynamic = 'force-dynamic';

export default async function GymPage() {
  const user = await requireUser();

  const logs = await db.query.gymLogs.findMany({
    where: eq(gymLogs.userId, user.userId),
    orderBy: [desc(gymLogs.logDate)],
  });

  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const last30 = logs.filter((l) => l.logDate >= thirtyDaysAgo);
  const totalMinutes = last30.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gym Progress" description="Log sessions and watch your consistency build." />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground">Sessions (last 30 days)</p>
            <p className="mt-1 text-2xl font-extrabold">{last30.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground">Minutes (last 30 days)</p>
            <p className="mt-1 text-2xl font-extrabold">{totalMinutes}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a session</CardTitle>
        </CardHeader>
        <CardContent>
          <GymForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
          ) : (
            logs.slice(0, 25).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    💪 {l.workoutType}
                    {l.durationMinutes ? ` · ${l.durationMinutes} min` : ''}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(parseISO(l.logDate), 'EEE, MMM d')}
                    {l.notes ? ` — ${l.notes}` : ''}
                  </p>
                </div>
                <DeleteRowButton action={deleteGymLog.bind(null, l.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
