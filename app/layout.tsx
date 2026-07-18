import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const nunito = Nunito({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Jolly',
  description: "Betty's whole life, sorted — med school, personal life, and work in one bubbly dashboard.",
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#7a1f3d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} ${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
