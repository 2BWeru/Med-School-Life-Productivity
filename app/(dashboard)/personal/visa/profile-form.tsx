'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveVisaProfile } from './actions';

type Profile = {
  schoolName: string;
  country: string;
  visaType: string | null;
  renewalDate: string | null;
  feeAmount: string | null;
  feeCurrency: string;
  notes: string | null;
} | null;

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={saveVisaProfile} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="schoolName">School</Label>
        <Input
          id="schoolName"
          name="schoolName"
          defaultValue={profile?.schoolName ?? 'Gullas College of Medicine'}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" defaultValue={profile?.country ?? 'Philippines'} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visaType">Visa type</Label>
        <Input id="visaType" name="visaType" defaultValue={profile?.visaType ?? ''} placeholder="e.g. Student Visa 9(f)" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="renewalDate">Renewal date</Label>
        <Input id="renewalDate" name="renewalDate" type="date" defaultValue={profile?.renewalDate ?? ''} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feeAmount">Fee amount</Label>
        <Input id="feeAmount" name="feeAmount" type="number" step="0.01" defaultValue={profile?.feeAmount ?? ''} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feeCurrency">Currency</Label>
        <Input id="feeCurrency" name="feeCurrency" defaultValue={profile?.feeCurrency ?? 'USD'} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={profile?.notes ?? ''} rows={2} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
