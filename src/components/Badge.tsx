import React from 'react';

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'slate' | 'indigo' | 'orange' | 'pink';

interface BadgeProps {
  label: string;
  color?: Color;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const colorMap: Record<Color, string> = {
  green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  yellow: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
};

const dotColorMap: Record<Color, string> = {
  green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-amber-500', blue: 'bg-blue-500',
  purple: 'bg-purple-500', slate: 'bg-slate-500', indigo: 'bg-indigo-500', orange: 'bg-orange-500', pink: 'bg-pink-500',
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'slate', dot, size = 'sm' }) => (
  <span className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${colorMap[color]}`}>
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColorMap[color]}`} />}
    {label}
  </span>
);

export const statusBadge = (status: string): React.ReactElement => {
  const map: Record<string, { label: string; color: Color }> = {
    active: { label: 'Aktiv', color: 'green' },
    full: { label: "To'lgan", color: 'yellow' },
    archived: { label: 'Arxiv', color: 'slate' },
    frozen: { label: 'Muzlatilgan', color: 'blue' },
    left: { label: 'Ketgan', color: 'red' },
    pending: { label: "To'lanmagan", color: 'yellow' },
    partial: { label: 'Qisman', color: 'orange' },
    paid: { label: "To'langan", color: 'green' },
    present: { label: 'Keldi', color: 'green' },
    absent: { label: 'Kelmadi', color: 'red' },
    late: { label: 'Kech qoldi', color: 'yellow' },
    excused: { label: 'Sababli', color: 'blue' },
    new: { label: 'Yangi', color: 'blue' },
    contacted: { label: "Aloqa o'rnatildi", color: 'indigo' },
    qualified: { label: 'Malakali', color: 'purple' },
    won: { label: "O'quvchi", color: 'green' },
    lost: { label: "Yo'qolgan", color: 'red' },
    vacation: { label: 'Tatilda', color: 'yellow' },
    fired: { label: "Ishdan bo'shagan", color: 'red' },
  };
  const cfg = map[status] ?? { label: status, color: 'slate' as Color };
  return <Badge label={cfg.label} color={cfg.color} dot />;
};
