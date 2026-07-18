'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navLinks } from './nav-links';
import { logout } from '@/app/logout-action';

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Stethoscope className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Med Life</p>
          <p className="text-xs leading-tight text-muted-foreground">Productivity Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-2">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
