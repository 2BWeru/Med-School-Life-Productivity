import { eq } from 'drizzle-orm';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { db } from '@/lib/db';
import { visaProfile, visaDocuments } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileForm } from './profile-form';
import { AddDocForm } from './add-doc-form';
import { DocumentRow } from './document-row';

export const dynamic = 'force-dynamic';

export default async function VisaPage() {
  const user = await requireUser();

  const [profile, documents] = await Promise.all([
    db.query.visaProfile.findFirst({ where: eq(visaProfile.userId, user.userId) }),
    db.query.visaDocuments.findMany({ where: eq(visaDocuments.userId, user.userId) }),
  ]);

  const daysUntilRenewal = profile?.renewalDate
    ? differenceInCalendarDays(parseISO(profile.renewalDate), new Date())
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Visa Tracker"
        description="Documents, expiry, and fees for your student visa renewal."
      />

      {daysUntilRenewal !== null ? (
        <div className="rounded-2xl bg-gold-soft px-5 py-3.5 text-sm font-bold text-gold-foreground">
          🛂 {daysUntilRenewal} days until your visa renewal is due
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Your visa details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents checklist</CardTitle>
          <CardDescription>Tap a status pill to cycle pending → ready → submitted.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddDocForm />
          <div className="flex flex-col divide-y divide-border">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents added yet.</p>
            ) : (
              documents.map((d) => <DocumentRow key={d.id} doc={d} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
