import {
  BookOpen,
  Compass,
  CalendarRange,
  ClipboardList,
  Cake,
  Soup,
  Dumbbell,
  Stamp,
  Home as HomeIcon,
  Mic2,
  Briefcase,
  ListChecks,
  Flame,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  colorVar: '--maroon' | '--primary' | '--plum' | '--muted-foreground';
  items: NavLink[];
};

export const navGroups: NavGroup[] = [
  {
    label: 'Med School',
    colorVar: '--maroon',
    items: [
      { href: '/med-school', label: "Today's Lectures", icon: BookOpen },
      { href: '/med-school/vision-board', label: 'Vision Board', icon: Compass },
      { href: '/med-school/semester', label: 'Semester Planner', icon: CalendarRange },
      { href: '/study', label: 'Study Tracker', icon: ClipboardList },
      { href: '/exams', label: 'Exams & CATs', icon: ClipboardList },
    ],
  },
  {
    label: 'Personal Life',
    colorVar: '--primary',
    items: [
      { href: '/personal/birthdays', label: 'Birthdays & Trips', icon: Cake },
      { href: '/personal/meals', label: 'Meals', icon: Soup },
      { href: '/personal/gym', label: 'Gym Progress', icon: Dumbbell },
      { href: '/personal/visa', label: 'Visa Tracker', icon: Stamp },
      { href: '/personal/finances', label: 'Home & Finances', icon: HomeIcon },
      { href: '/personal/speaking', label: 'Public Speaking', icon: Mic2 },
    ],
  },
  {
    label: 'Work',
    colorVar: '--plum',
    items: [{ href: '/work', label: 'EVA Clients', icon: Briefcase }],
  },
  {
    label: 'More',
    colorVar: '--muted-foreground',
    items: [
      { href: '/tasks', label: 'Tasks', icon: ListChecks },
      { href: '/habits', label: 'Habits', icon: Flame },
      { href: '/journal', label: 'Journal', icon: NotebookPen },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((g) => g.items);
