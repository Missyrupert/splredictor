'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const USER_LINKS = [
  { href: '/',            label: 'Home'        },
  { href: '/predict',     label: 'Predict'     },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const ADMIN_LINK = { href: '/admin', label: 'Admin' };

export default function Nav() {
  const pathname = usePathname();
  const [player, setPlayer] = useState<string | null>(null);

  useEffect(() => {
    setPlayer(localStorage.getItem('top6_player'));
    const onStorage = () => setPlayer(localStorage.getItem('top6_player'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-pitch-900/95 backdrop-blur border-b border-pitch-700">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-black text-white leading-none">Top 6</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Predictor
          </span>
        </Link>

        {/* Nav links — hidden on very small screens, shown from sm */}
        <nav className="hidden sm:flex items-center gap-1">
          {[...USER_LINKS, ...(player === 'CJ' ? [ADMIN_LINK] : [])].map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-pitch-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-pitch-800'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Active player chip */}
        {player ? (
          <Link
            href="/"
            className="shrink-0 text-xs bg-pitch-700 border border-pitch-600 text-slate-300 px-2.5 py-1 rounded-full font-bold hover:bg-pitch-600 transition-colors"
          >
            {player}
          </Link>
        ) : (
          <Link
            href="/"
            className="shrink-0 text-xs text-emerald-400 font-bold hover:underline"
          >
            Select player
          </Link>
        )}
      </div>

      {/* Mobile nav bar */}
      <nav className="sm:hidden flex border-t border-pitch-700">
        {[...USER_LINKS, ...(player === 'CJ' ? [ADMIN_LINK] : [])].map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 py-2 text-center text-xs font-bold transition-colors ${
                active ? 'text-white bg-pitch-800' : 'text-slate-500 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
