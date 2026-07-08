import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Globe2, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

interface NavbarProps {
  onEnterPortal: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: 'uz' | 'ru' | 'en';
  setLanguage: (l: 'uz' | 'ru' | 'en') => void;
  t: Record<string, string>;
}

export const Navbar: React.FC<NavbarProps> = ({
  onEnterPortal,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  t,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const langNames = { uz: "O'zbekcha", ru: 'Русский', en: 'English' };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-base tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                Brain IT <span className="text-teal-600 text-xs px-1.5 py-0.5 rounded bg-teal-500/10 dark:bg-teal-500/20">PRO</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 -mt-1">
                Ecosystem
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-zinc-600 dark:text-zinc-400">
            <a href="#courses" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navCourses || "O'quv Kurslari"}
            </a>
            <a href="#services" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navServices || "Dasturiy Yechimlar"}
            </a>
            <a href="#projects" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Loyihalar
            </a>
            <a href="#contact" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navContact || "Bog'lanish"}
            </a>
          </nav>

          {/* Right Actions: Theme, Lang, Portal CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase"
              >
                <Globe2 className="w-4 h-4" />
                {language}
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl p-1.5 z-50">
                  {(['uz', 'ru', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLanguage(l); setLangDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        language === l
                          ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {langNames[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Toggle with Smooth Animation */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors relative overflow-hidden"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {darkMode ? (
                  <motion.div
                    key="moon"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-teal-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Enter Portal CTA */}
            <button
              onClick={onEnterPortal}
              className="btn-primary text-xs py-2 px-4 shadow-sm shadow-teal-600/20"
            >
              <span>{t.navPortal || "LMS Portaliga Kirish"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {darkMode ? <Moon className="w-4 h-4 text-teal-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border p-6 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-4 font-semibold text-base text-zinc-700 dark:text-zinc-300">
              <a
                href="#courses"
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
              >
                <span>{t.navCourses || "O'quv Kurslari"}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </a>
              <a
                href="#services"
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
              >
                <span>{t.navServices || "Dasturiy Yechimlar"}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </a>
              <a
                href="#projects"
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
              >
                <span>Loyihalar</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </a>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center"
              >
                <span>{t.navContact || "Bog'lanish"}</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </a>

              {/* Mobile Language & Portal */}
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Tilni tanlang</span>
                  <div className="flex gap-1">
                    {(['uz', 'ru', 'en'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLanguage(l); setMenuOpen(false); }}
                        className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                          language === l
                            ? 'bg-teal-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); onEnterPortal(); }}
                  className="btn-primary w-full py-3 mt-2"
                >
                  <span>{t.navPortal || "LMS Portaliga Kirish"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
