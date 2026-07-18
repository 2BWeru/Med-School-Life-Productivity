import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ApplicationForm } from './application-form';
import { ApplicationRow } from './application-row';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const user = await requireUser();

  const items = await db.query.applications.findMany({
    where: eq(applications.userId, user.userId),
    orderBy: [desc(applications.createdAt)],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Exchanges, scholarships, conferences, internships — all in one tracker."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add an application</CardTitle>
          <CardDescription>Your fully-funded-opportunities tracker.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All applications ({items.length})</CardTitle>
          <CardDescription>Tap a status pill to cycle planned → applied → accepted → rejected.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications tracked yet.</p>
          ) : (
            items.map((a) => <ApplicationRow key={a.id} application={a} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
