import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { PushSetup } from '@/components/dashboard/push-setup';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        name={session.name}
        goldStars={user?.goldStars ?? 0}
        streakDays={user?.currentStreak ?? 0}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5">
            <PushSetup />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
