import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Briefcase, Coffee, Palmtree, XCircle } from 'lucide-react';

export type StatusType =
  | 'paid'
  | 'auto'
  | 'pending'
  | 'debt'
  | 'completed'
  | 'uncompleted'
  | 'shift'
  | 'off'
  | 'vacation'
  | 'present'
  | 'absent';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showIcon = true,
}) => {
  const configMap: Record<StatusType, { text: string; styles: string; icon: React.ReactNode }> = {
    paid: {
      text: "To'landi",
      styles: 'bg-green-500/15 border-green-500/35 text-green-700 dark:text-green-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    auto: {
      text: "Avtomat (Click/Payme)",
      styles: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-800 dark:text-emerald-300',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    pending: {
      text: "Kutilmoqda",
      styles: 'bg-amber-500/15 border-amber-500/35 text-amber-700 dark:text-amber-400',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    debt: {
      text: "Qarzdor",
      styles: 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-400',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    completed: {
      text: "Bajarilgan",
      styles: 'bg-green-500/15 border-green-500/35 text-green-700 dark:text-green-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    uncompleted: {
      text: "Bajarilmagan",
      styles: 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-400',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    shift: {
      text: "Smenada",
      styles: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-800 dark:text-emerald-300 font-extrabold',
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    off: {
      text: "Dam olishda",
      styles: 'bg-slate-500/15 border-slate-500/35 text-slate-700 dark:text-slate-400',
      icon: <Coffee className="w-3.5 h-3.5" />,
    },
    vacation: {
      text: "Ta'tilda",
      styles: 'bg-sky-500/15 border-sky-500/35 text-sky-700 dark:text-sky-400',
      icon: <Palmtree className="w-3.5 h-3.5" />,
    },
    present: {
      text: "Keldi",
      styles: 'bg-green-500/15 border-green-500/35 text-green-700 dark:text-green-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    absent: {
      text: "Kelmadı",
      styles: 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-400',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const item = configMap[status] || {
    text: status,
    styles: 'bg-slate-500/15 border-slate-500/35 text-slate-700 dark:text-slate-400',
    icon: <Clock className="w-3.5 h-3.5" />,
  };

  const sizeStyles =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] gap-1.5'
      : 'px-3 py-1 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${sizeStyles} ${item.styles} shadow-2xs transition-all`}
    >
      {showIcon && item.icon}
      <span>{label || item.text}</span>
    </span>
  );
};
