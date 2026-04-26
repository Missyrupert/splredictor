import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Top 6 Prediction League',
  description: 'Scottish Premiership Top 6 post-split predictions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pitch-950 text-slate-100 font-sans antialiased">
        <Nav />
        <main className="max-w-2xl mx-auto px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
