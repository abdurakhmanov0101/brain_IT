import React from 'react';
import { MapPin, Phone, Mail, Globe2, ArrowUp } from 'lucide-react';

interface FooterProps {
  onEnterPortal: () => void;
  t: Record<string, string>;
}

export const Footer: React.FC<FooterProps> = ({ onEnterPortal, t }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border pt-16 pb-12 relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-base">
                B
              </div>
              <span className="font-heading font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                Brain IT <span className="text-violet-600 font-normal">Academy & Co</span>
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              {t.footerDesc ||
                "IT ta'lim va enterprise dasturiy yechimlar platformasi. Termiz shahri, Surxondaryo."}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterPortal}
                className="btn-outline text-xs py-2 px-3.5"
              >
                <span>{t.navPortal || "LMS Portaliga Kirish"}</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.footerLinks || "Havolalar"}
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="#courses" className="hover:text-violet-600 transition-colors">{t.navCourses || "O'quv Kurslari"}</a></li>
              <li><a href="#services" className="hover:text-violet-600 transition-colors">{t.navServices || "Dasturiy Yechimlar"}</a></li>
              <li><a href="#projects" className="hover:text-violet-600 transition-colors">Loyihalar</a></li>
              <li><a href="#team" className="hover:text-violet-600 transition-colors">Jamoa</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.contactTitle || "Bog'lanish"}
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <span>Termiz shahri, Yubileyny</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-violet-600 shrink-0" />
                <a href="tel:+998990670066" className="hover:text-violet-600 transition-colors">+998 99 067 00 66</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                <a href="mailto:info@brainit.uz" className="hover:text-violet-600 transition-colors">info@brainit.uz</a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.footerSocial || "Ijtimoiy tarmoqlar"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Telegram', 'Instagram', 'YouTube', 'LinkedIn'].map((soc) => (
                <a
                  key={soc}
                  href="#"
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all"
                >
                  {soc}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>{t.footerText || "© 2026 Brain IT Academy & Co. Barcha huquqlar himoyalangan."}</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-violet-600 transition-colors font-semibold"
          >
            <span>Yuqoriga</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
