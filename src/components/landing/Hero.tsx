import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PlayCircle, ShieldCheck, Zap, Users, CheckCircle } from 'lucide-react';
import { CountUp } from '../common/CountUp';

interface HeroProps {
  onEnterPortal: () => void;
  onScrollToContact: () => void;
  t: Record<string, string>;
}

export const Hero: React.FC<HeroProps> = ({ onEnterPortal, onScrollToContact, t }) => {
  return (
    <section className="relative min-h-[92vh] pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden z-10 flex items-center justify-center">
      {/* Background Video — ONLY IN HERO SECTION, SCROLLS AWAY WITH HERO */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#09090b]">
        <iframe
          src="https://www.youtube.com/embed/FVeDsAdpqTQ?autoplay=1&mute=1&loop=1&playlist=FVeDsAdpqTQ&controls=0&showinfo=0&rel=0&iv_load_policy=3"
          title="Hero Background Video"
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] sm:w-[150vw] sm:h-[150vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover opacity-45 scale-105"
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {/* Dark Vignette + Bottom Gradient Fade to merge smoothly into sections below without sharp border */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-[#09090b]" />
        <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#09090b] dark:to-transparent pointer-events-none z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>O'ZBEKISTONDA #1 O'QUV MARKAZ CRM TIZIMI</span>
          </motion.div>

          {/* EduTizim-style Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1] drop-shadow-xl"
          >
            <span>O'quv markazingiz uchun </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 block sm:inline">
              mukammal
            </span>
            <span> boshqaruv tizimi</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl lg:text-2xl text-zinc-200 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md"
          >
            Qo'lda yuritiladigan jadvallar, yo'qolgan to'lovlar va cheksiz qo'ng'iroqlarni unuting. Brain IT CRM davomat, moliya, to'lovlar va ota-onalar bilan aloqani 100% avtomatlashtiradi.
          </motion.p>

          {/* EduTizim-style Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-3"
          >
            <button
              onClick={onEnterPortal}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-teal-600/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2.5"
            >
              <span>Tizimni sinab ko'rish</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onScrollToContact}
              className="py-4 px-8 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base backdrop-blur-md transition-all flex items-center gap-2.5 hover:scale-[1.03] active:scale-95"
            >
              <PlayCircle className="w-5 h-5 text-teal-400" />
              <span>Demoni bron qilish</span>
            </button>
          </motion.div>

          {/* Key Trust Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-white/15 text-center"
          >
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-white">
                <CountUp end={200} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">O'quv Markazlari</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-teal-400">
                <CountUp end={99.9} decimals={1} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">Davomat Aniqligi</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-emerald-400">
                <CountUp end={65} prefix="+" suffix="%" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">Moliya Shaffofligi</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-black text-3xl sm:text-4xl text-cyan-400">24/7</div>
              <div className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">Ota-ona Nazorati</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
