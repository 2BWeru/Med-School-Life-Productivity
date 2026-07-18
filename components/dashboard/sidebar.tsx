'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navGroups } from './nav-links';
import { logout } from '@/app/logout-action';

export function Sidebar({
  name,
  goldStars,
  streakDays,
}: {
  name: string;
  goldStars: number;
  streakDays: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-maroon shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="5.5" cy="8" r="1.6" fill="white" />
            <circle cx="12.5" cy="8" r="1.6" fill="white" />
            <path
              d="M4.5 11.5 Q9 15 13.5 11.5"
              stroke="white"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="font-display text-lg font-extrabold leading-none tracking-tight">Jolly</p>
          <p className="mt-0.5 text-[11px] font-semibold leading-none text-muted-foreground">
            {name}&apos;s whole life, sorted
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-extrabold uppercase tracking-wide"
              style={{ color: `hsl(var(${group.colorVar}))` }}
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: `hsl(var(${group.colorVar}))` }}
              />
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-foreground/90 transition-colors hover:bg-card-tint',
                      isActive && 'bg-secondary text-secondary-foreground hover:bg-secondary',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-3 py-3">
        <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-maroon">
          <Flame className="h-4 w-4" />
          <span className="tabular-nums">{streakDays}-day streak</span>
        </div>
        <div className="flex items-center gap-1 text-[13px] font-extrabold text-gold-foreground">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="tabular-nums">{goldStars}</span>
        </div>
      </div>
      <div className="border-t border-border p-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-card-tint hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
