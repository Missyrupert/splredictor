import { TEAM_META } from '@/lib/fixtures';

interface Props {
  team: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: 'w-8 h-8 text-[9px]',
  md: 'w-11 h-11 text-[11px]',
  lg: 'w-16 h-16 text-sm',
};

export default function TeamBadge({ team, size = 'md' }: Props) {
  const meta = TEAM_META[team];
  const color = meta?.color ?? '#475569';
  const label = meta?.badge ?? team.slice(0, 3).toUpperCase();

  return (
    <div
      className={`${SIZE[size]} rounded-xl flex items-center justify-center font-black tracking-tight shrink-0`}
      style={{
        backgroundColor: color + '22',
        border: `2px solid ${color}55`,
        color,
      }}
    >
      {label}
    </div>
  );
}
