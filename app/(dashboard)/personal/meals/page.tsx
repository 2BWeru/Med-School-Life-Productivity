import { eq, and } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { foodPreferences, mealPlans } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FoodPrefs } from './food-prefs';
import { ShuffleButton } from './shuffle-button';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  const user = await requireUser();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [prefs, todayPlan] = await Promise.all([
    db.query.foodPreferences.findMany({ where: eq(foodPreferences.userId, user.userId) }),
    db.query.mealPlans.findFirst({
      where: and(eq(mealPlans.userId, user.userId), eq(mealPlans.planDate, today)),
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meals"
        description="Tell Jolly what you like once — it handles the rotation from here."
      />

      <Card>
        <CardHeader>
          <CardTitle>Foods I enjoy</CardTitle>
        </CardHeader>
        <CardContent>
          <FoodPrefs prefs={prefs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s plan</CardTitle>
          <CardDescription>Auto-picked from your list, avoiding recent repeats.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-card-tint p-3.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Breakfast
              </p>
              <p className="mt-1 text-sm font-bold">🥣 {todayPlan?.breakfast ?? 'Not set yet'}</p>
            </div>
            <div className="rounded-xl bg-card-tint p-3.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Lunch
              </p>
              <p className="mt-1 text-sm font-bold">🍛 {todayPlan?.lunch ?? 'Not set yet'}</p>
            </div>
            <div className="rounded-xl bg-card-tint p-3.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Snack
              </p>
              <p className="mt-1 text-sm font-bold">🥭 {todayPlan?.snack ?? 'Not set yet'}</p>
            </div>
          </div>
          <div>
            <ShuffleButton />
          </div>
          {prefs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Add a few foods you enjoy above, then shuffle to get today&apos;s plan.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
