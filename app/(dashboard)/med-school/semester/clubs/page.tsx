import { desc, eq } from 'drizzle-orm';
import { format, parseISO } from 'date-fns';
import { db } from '@/lib/db';
import { clubs } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { ClubForm } from './club-form';
import { deleteClub } from './actions';

export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
  const user = await requireUser();

  const items = await db.query.clubs.findMany({
    where: eq(clubs.userId, user.userId),
    orderBy: [desc(clubs.joinedDate)],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clubs Joined" description="Your student society and leadership involvement." />

      <Card>
        <CardHeader>
          <CardTitle>Add a club</CardTitle>
          <CardDescription>Feeds into your Career checklist progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClubForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All clubs ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clubs added yet.</p>
          ) : (
            items.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.role ? `${c.role} · ` : ''}
                    {c.joinedDate ? format(parseISO(c.joinedDate), 'MMM d, yyyy') : 'Joined date not set'}
                  </p>
                </div>
                <DeleteRowButton action={deleteClub.bind(null, c.id)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
