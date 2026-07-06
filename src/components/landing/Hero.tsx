import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, Code, Server, Award, PlayCircle } from 'lucide-react';

interface HeroProps {
  onEnterPortal: () => void;
  onScrollToContact: () => void;
  t: Record<string, string>;
}

export const Hero: React.FC<HeroProps> = ({ onEnterPortal, onScrollToContact, t }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.heroBadge || "Brain IT Ecosystem"}</span>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
          >
            {t.heroEyebrow || "Kelajak faqat IT bilan!"}
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading font-black text-5xl sm:text-[5rem] lg:text-[6rem] tracking-tight text-white leading-[1.05]"
          >
            <span>{t.heroTitle || "0 dan dasturchi bo'lib chiqing!"}</span>
            <span className="text-violet-400 block sm:inline">{t.heroTitleAccent || " Professional darajada."}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl lg:text-[22px] text-zinc-200 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {t.heroText ||
              "Kompyuter, telefon va biznesni avtomatlashtirishga tegishli dasturlar yaratamiz. Farzandingizni ham dasturchi bo'lishiga professional yondashamiz."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <a
              href="#courses"
              className="btn-primary py-3 px-6 text-base shadow-lg shadow-violet-600/25"
            >
              <span>{t.btnCourses || "Kurslarni ko'rish"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onScrollToContact}
              className="btn-secondary py-3 px-6 text-base font-semibold"
            >
              <span>{t.btnContact || "Konsultatsiya olish"}</span>
            </button>
            <button
              onClick={onEnterPortal}
              className="btn-outline py-3 px-6 text-base font-semibold hidden sm:inline-flex"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{t.btnPortal || "LMS Portaliga kirish"}</span>
            </button>
          </motion.div>

          {/* Key Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-zinc-200 dark:border-zinc-800 text-left sm:text-center"
          >
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-white">500+</div>
              <div className="text-sm sm:text-base font-bold text-zinc-300">{t.statsGraduates || "Bitiruvchilar"}</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-violet-400">88%</div>
              <div className="text-sm sm:text-base font-bold text-zinc-300">{t.statsPlacement || "Ishga joylashish"}</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-white">35+</div>
              <div className="text-sm sm:text-base font-bold text-zinc-300">{t.statsPartners || "Hamkorlar"}</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-violet-400">12+</div>
              <div className="text-sm sm:text-base font-bold text-zinc-300">{t.statsCourses || "Kurslar"}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
