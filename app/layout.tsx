import type { Metadata } from 'next';
import './globals.css';
import AmbientMusic from '@/components/AmbientMusic';

export const metadata: Metadata = {
  metadataBase: new URL('https://cinemasplit.com'),
  title: 'Cinemasplit — Cinema, split by the way you feel',
  description:
    'An emotionally intelligent cinematic universe. 140 curated films across 14 emotional states and 12 mood worlds. Find the film that already understands you.',
  openGraph: {
    title: 'Cinemasplit',
    description: 'Cinema, split by the way you feel.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AmbientMusic />
      </body>
    </html>
  );
}
