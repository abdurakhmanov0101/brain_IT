import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, AlertCircle } from 'lucide-react';

export const NeuronIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12 text-brand-500 dark:text-brand-400" }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Connections */}
    <line x1="12" y1="16" x2="28" y2="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="12" y1="16" x2="20" y2="36" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="28" y1="12" x2="38" y2="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="20" y1="36" x2="38" y2="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="8" y1="30" x2="20" y2="36" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="8" y1="30" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
    
    {/* Nodes */}
    <circle cx="12" cy="16" r="4.5" fill="currentColor" className="animate-pulse" />
    <circle cx="28" cy="12" r="5" fill="currentColor" style={{ animationDelay: '0.2s' }} className="animate-pulse" />
    <circle cx="20" cy="36" r="4" fill="currentColor" style={{ animationDelay: '0.4s' }} className="animate-pulse" />
    <circle cx="38" cy="28" r="6" fill="currentColor" style={{ animationDelay: '0.6s' }} className="animate-pulse" />
    <circle cx="8" cy="30" r="3.5" fill="currentColor" style={{ animationDelay: '0.8s' }} className="animate-pulse" />
  </svg>
);

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Ma'lumot topilmadi",
  message = "Hozircha bu yerda hech qanday ma'lumot yo'q.",
  icon = <NeuronIcon className="w-14 h-14 text-brand-500 dark:text-brand-400" />,
  action
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 w-full"
    >
      <div className="w-24 h-24 bg-white dark:bg-zinc-800/80 shadow-sm rounded-2xl flex items-center justify-center mb-5 border border-zinc-100 dark:border-zinc-800/60">
        {icon}
      </div>
      <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">{message}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export const ErrorState: React.FC<EmptyStateProps> = ({
  title = "Xatolik yuz berdi",
  message = "Tizimda kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki admin bilan bog'laning.",
  action
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 w-full"
    >
      <div className="w-20 h-20 bg-white dark:bg-zinc-800 shadow-sm rounded-full flex items-center justify-center mb-5 border border-rose-100 dark:border-rose-500/20">
        <AlertCircle className="w-10 h-10 text-rose-500" />
      </div>
      <h3 className="font-heading font-bold text-lg text-rose-700 dark:text-rose-400 mb-2">{title}</h3>
      <p className="text-sm text-rose-600 dark:text-rose-300 max-w-md mb-6">{message}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};
