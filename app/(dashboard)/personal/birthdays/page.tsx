import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { birthdays } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { BirthdayForm } from './birthday-form';
import { deleteBirthday } from './actions';

export const dynamic = 'force-dynamic';

function daysUntilNext(month: number, day: number, from: Date) {
  const year = from.getFullYear();
  let next = new Date(year, month - 1, day);
  next.setHours(0, 0, 0, 0);
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  if (next < today) next = new Date(year + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function BirthdaysPage() {
  const user = await requireUser();

  const items = await db.query.birthdays.findMany({ where: eq(birthdays.userId, user.userId) });
  const now = new Date();

  const sorted = items
    .map((b) => ({ ...b, daysUntil: daysUntilNext(b.month, b.day, now) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Birthdays & Trips"
        description="Never miss a special occasion — reminders show on your home dashboard as they get close."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a birthday</CardTitle>
        </CardHeader>
        <CardContent>
          <BirthdayForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming ({sorted.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No birthdays added yet.</p>
          ) : (
            sorted.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    🎂 {b.name} — {MONTH_NAMES[b.month - 1]} {b.day}
                  </p>
                  {b.notes ? (
                    <p className="truncate text-xs text-muted-foreground">{b.notes}</p>
                  ) : null}
                </div>
                <Badge variant={b.daysUntil <= 7 ? 'destructive' : 'outline'} className="shrink-0">
                  {b.daysUntil === 0 ? 'Today!' : `${b.daysUntil}d`}
                </Badge>
                <DeleteRowButton action={deleteBirthday.bind(null, b.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
