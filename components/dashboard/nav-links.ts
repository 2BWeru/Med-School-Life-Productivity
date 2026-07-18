import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  CalendarClock,
  Flame,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navLinks: NavLink[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/study', label: 'Study Tracker', icon: BookOpen },
  { href: '/exams', label: 'Exams & Deadlines', icon: CalendarClock },
  { href: '/habits', label: 'Habits', icon: Flame },
  { href: '/journal', label: 'Journal', icon: NotebookPen },
];
