import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, iconColor = 'text-indigo-600 dark:text-indigo-400', trend, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 space-y-3 ${onClick ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-md' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-heading font-black text-slate-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {trend && (
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {trend.value >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
        <span className="text-slate-400 font-normal">{trend.label}</span>
      </div>
    )}
  </div>
);
