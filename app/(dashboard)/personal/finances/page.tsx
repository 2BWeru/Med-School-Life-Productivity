import { desc, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { financeEntries } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FinanceForm } from './finance-form';
import { FinanceRow } from './finance-row';

export const dynamic = 'force-dynamic';

export default async function FinancesPage() {
  const user = await requireUser();

  const entries = await db.query.financeEntries.findMany({
    where: eq(financeEntries.userId, user.userId),
    orderBy: [desc(financeEntries.dueDate)],
  });

  const thisMonthPrefix = format(new Date(), 'yyyy-MM');
  const thisMonth = entries.filter((e) => e.dueDate?.startsWith(thisMonthPrefix));
  const totalThisMonth = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);
  const paidThisMonth = thisMonth.filter((e) => e.paid).reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Home & Finances"
        description="Rent, utilities, and everything else — with a running monthly total."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground">This month, total due</p>
            <p className="mt-1 text-2xl font-extrabold">${totalThisMonth.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground">This month, paid so far</p>
            <p className="mt-1 text-2xl font-extrabold text-good">${paidThisMonth.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add an entry</CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All entries</CardTitle>
          <CardDescription>Tap an entry to mark it paid.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing tracked yet.</p>
          ) : (
            entries.map((e) => <FinanceRow key={e.id} entry={e} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
