import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Work"
        description="Your Executive Virtual Assistant work, once you're between clients or active with one."
      />
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-3xl">💼</p>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            No active client yet — this space fills in the moment you land your next EVA client.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
