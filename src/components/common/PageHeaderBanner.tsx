import React from 'react';

export type PageThemeAccent = 'teal' | 'blue' | 'emerald' | 'amber' | 'slate' | 'cyan' | 'rose';

interface PageHeaderBannerProps {
  category: string;
  title: string;
  description: string;
  accent?: PageThemeAccent;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  category,
  title,
  description,
  accent = 'emerald',
  icon,
  rightAction,
}) => {
  const badgeStyles: Record<PageThemeAccent, string> = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    blue: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const topBarStyles: Record<PageThemeAccent, string> = {
    teal: 'from-teal-600 via-emerald-600 to-emerald-600',
    blue: 'from-emerald-600 via-cyan-500 to-sky-600',
    emerald: 'from-emerald-600 via-teal-500 to-green-600',
    amber: 'from-amber-500 via-orange-500 to-yellow-500',
    slate: 'from-slate-700 via-slate-600 to-zinc-700',
    cyan: 'from-cyan-600 via-teal-500 to-emerald-500',
    rose: 'from-rose-600 via-red-500 to-pink-600',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm mb-6">
      {/* Decorative colored top signature bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${topBarStyles[accent]}`} />
      
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${badgeStyles[accent]}`}
            >
              {icon && <span className="w-3.5 h-3.5">{icon}</span>}
              <span>{category}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            {description}
          </p>
        </div>

        {rightAction && (
          <div className="flex items-center shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};
