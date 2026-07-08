import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  hideHeader?: boolean;
}

const sizes = { 
  sm: 'max-w-sm', 
  md: 'max-w-lg', 
  lg: 'max-w-2xl', 
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw] h-[95vh]'
};

export const Modal: React.FC<ModalProps> = ({ 
  open, onClose, title, children, size = 'md', className = '', hideHeader = false 
}) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal Container */}
          <motion.div 
            role="dialog"
            aria-modal="true"
            aria-labelledby={typeof title === 'string' ? title : 'modal-title'}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} flex flex-col bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] z-10 ${className}`}
          >
            {/* Header */}
            {!hideHeader && (
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-light-border dark:border-dark-border bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="font-heading font-black text-lg text-zinc-900 dark:text-white truncate pr-4">
                  {title}
                </h2>
                <button 
                  onClick={onClose} 
                  className="shrink-0 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
