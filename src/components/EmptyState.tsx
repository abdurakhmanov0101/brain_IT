import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Ma'lumot topilmadi",
  message = "Hozircha bu yerda hech qanday ma'lumot yo'q.",
  icon = <FileQuestion className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />,
  action
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 w-full"
    >
      <div className="w-20 h-20 bg-white dark:bg-zinc-800 shadow-sm rounded-full flex items-center justify-center mb-5">
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
