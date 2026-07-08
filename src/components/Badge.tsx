import React from 'react';

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'teal' | 'zinc' | 'amber' | 'emerald' | 'rose';

interface BadgeProps {
  label: string;
  color?: Color;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const colorMap: Record<Color, string> = {
  green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  red: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  yellow: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  blue: 'bg-blue-50 dark:bg-emerald-500/10 text-blue-700 dark:text-emerald-400 border-blue-200 dark:border-emerald-500/20',
  teal: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  zinc: 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20',
};

const dotColorMap: Record<Color, string> = {
  green: 'bg-emerald-500 dark:bg-emerald-400', 
  emerald: 'bg-emerald-500 dark:bg-emerald-400', 
  red: 'bg-rose-500 dark:bg-rose-400', 
  rose: 'bg-rose-500 dark:bg-rose-400', 
  yellow: 'bg-amber-500 dark:bg-amber-400', 
  amber: 'bg-amber-500 dark:bg-amber-400', 
  blue: 'bg-emerald-500 dark:bg-emerald-400',
  teal: 'bg-teal-500 dark:bg-teal-400', 
  zinc: 'bg-zinc-500 dark:bg-zinc-400',
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'zinc', dot, size = 'sm' }) => (
  <span className={`inline-flex items-center gap-1.5 border rounded-full font-bold uppercase tracking-wider ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${colorMap[color]}`}>
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColorMap[color]}`} />}
    {label}
  </span>
);

export const statusBadge = (status: string): React.ReactElement => {
  const map: Record<string, { label: string; color: Color }> = {
    active: { label: 'Aktiv', color: 'emerald' },
    full: { label: "To'lgan", color: 'amber' },
    archived: { label: 'Arxiv', color: 'zinc' },
    frozen: { label: 'Muzlatilgan', color: 'blue' },
    left: { label: 'Ketgan', color: 'rose' },
    pending: { label: "To'lanmagan", color: 'amber' },
    partial: { label: 'Qisman', color: 'yellow' },
    paid: { label: "To'langan", color: 'emerald' },
    present: { label: 'Keldi', color: 'emerald' },
    absent: { label: 'Kelmadi', color: 'rose' },
    late: { label: 'Kech qoldi', color: 'amber' },
    excused: { label: 'Sababli', color: 'blue' },
    new: { label: 'Yangi', color: 'blue' },
    contacted: { label: "Aloqa o'rnatildi", color: 'teal' },
    qualified: { label: 'Malakali', color: 'teal' },
    won: { label: "O'quvchi", color: 'emerald' },
    lost: { label: "Yo'qolgan", color: 'rose' },
    vacation: { label: 'Tatilda', color: 'amber' },
    fired: { label: "Ishdan bo'shagan", color: 'rose' },
  };
  const cfg = map[status] ?? { label: status, color: 'zinc' as Color };
  return <Badge label={cfg.label} color={cfg.color} dot />;
};
