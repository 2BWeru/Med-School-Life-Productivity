import { and, desc, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { db } from '@/lib/db';
import { journalEntries } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { JournalForm } from './journal-form';
import { JournalHistory } from './journal-history';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const user = await requireUser();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayEntry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.userId, user.userId), eq(journalEntries.entryDate, today)),
  });

  const [allEntries] = await Promise.all([
    db.query.journalEntries.findMany({
      where: eq(journalEntries.userId, user.userId),
      orderBy: [desc(journalEntries.entryDate)],
      limit: 30,
    }),
  ]);

  const pastEntries = allEntries.filter((e) => e.entryDate !== today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal"
        description="A quick daily check-in on mood and how things are going."
      />

      <Card>
        <CardHeader>
          <CardTitle>Today — {format(new Date(), 'EEEE, MMM d')}</CardTitle>
          <CardDescription>How are you feeling?</CardDescription>
        </CardHeader>
        <CardContent>
          <JournalForm
            entryDate={today}
            initialMood={todayEntry?.mood ?? 3}
            initialContent={todayEntry?.content ?? ''}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past entries</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalHistory entries={pastEntries} />
        </CardContent>
      </Card>
    </div>
  );
}
