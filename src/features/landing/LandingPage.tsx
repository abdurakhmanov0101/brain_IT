import React, { useState, useRef, useEffect } from 'react';
import {
  motion, useInView, useMotionValue, animate, AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight, CheckCircle, Code, Server, Award, Sparkles,
  Send, Sun, Moon, Cpu, Monitor, ShieldCheck, BookOpen, Globe2, Calculator,
  Smile, Menu, X, Zap, Brain, Rocket, Users, Star, ChevronRight,
  BarChart3, Shield, Cloud, Smartphone, Layers, Bot, MessageSquare,
  PlayCircle, Clock, MapPin, Phone, Mail, Link, AtSign, Rss, Camera, ArrowUp,
} from 'lucide-react';
import { courses, projects, type Course, type Project } from '../../data/mockData';
import { Navbar } from '../../components/landing/Navbar';
import { Hero } from '../../components/landing/Hero';
import { Footer } from '../../components/landing/Footer';
import { ChatWidget } from '../../components/ChatWidget';

/* ─────────── TYPES ─────────── */
interface LandingPageProps {
  onEnterPortal: () => void;
  onAddLead: (d: { name: string; phone: string; email: string; source: string; value: string; courseInterest?: string }) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: 'uz' | 'ru' | 'en';
  setLanguage: (l: 'uz' | 'ru' | 'en') => void;
  bgAnimationEnabled?: boolean;
  setBgAnimationEnabled?: (v: boolean) => void;
}

/* ─────────── ANIMATION VARIANTS ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const staggerFast = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/* ─────────── ANIMATED SECTION WRAPPER ─────────── */
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0,
}) => {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─────────── ANIMATED COUNTER ─────────── */
const Counter: React.FC<{ to: number; suffix?: string; prefix?: string }> = ({ to, suffix = '', prefix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(count, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix; },
    });
    return c.stop;
  }, [inView, to, count, suffix, prefix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
};

/* ─────────── SECTION BADGE ─────────── */
const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#10B981' }) => (
  <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-sm"
    style={{ borderColor: `${color}60`, background: `${color}20` }}>
    {children}
  </span>
);

/* ─────────── SECTION HEADING ─────────── */
const SectionHead: React.FC<{
  badge?: React.ReactNode; title: React.ReactNode; sub?: string; center?: boolean;
}> = ({ badge, title, sub, center = true }) => (
  <div className={`space-y-4 ${center ? 'text-center' : ''}`}>
    {badge}
    <motion.h2 variants={fadeUp}
      className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white drop-shadow-sm">
      {title}
    </motion.h2>
    {sub && <motion.p variants={fadeUp} className="max-w-2xl leading-relaxed text-sm sm:text-base mx-auto text-slate-600 dark:text-slate-300 font-medium">{sub}</motion.p>}
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPortal, onAddLead, darkMode: _appDarkMode, setDarkMode, language, setLanguage,
}) => {
  const darkMode = _appDarkMode ?? true;
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [teamModalId, setTeamModalId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadService, setLeadService] = useState('IT Foundation');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRegisterLead = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!leadName.trim()) return;
    let value = '3,500,000 UZS';
    if (leadService.includes('Frontend')) value = '4,000,000 UZS';
    if (leadService.includes('Backend')) value = '4,500,000 UZS';
    if (leadService.includes('Suniy') || leadService.includes('AI')) value = '5,200,000 UZS';
    if (leadService.includes('Kiber')) value = '5,800,000 UZS';
    onAddLead({ name: leadName, phone: leadPhone, email: leadEmail, source: 'Vebsayt Landing', value, courseInterest: leadService });
    setFormSubmitted(true);
    setTimeout(() => { setFormSubmitted(false); setLeadName(''); setLeadPhone(''); setLeadEmail(''); }, 3500);
  };

  /* ── TRANSLATIONS ── */
  const translations = {
    uz: {
      navCourses: "O'quv Kurslari", navServices: "Dasturiy Yechimlar", navContact: "Bog'lanish",
      navPortal: "LMS Portaliga Kirish",
      heroBadge: "Brain IT Ecosystem", heroEyebrow: "Kelajak faqat IT bilan!",
      heroTitle: "0 dan dasturchi bo'lib chiqing!", heroTitleAccent: " Professional darajada.",
      heroText: "Kompyuter va mobil ilovalar, shuningdek biznesni avtomatlashtirish tizimlarini ishlab chiqamiz. Farzandingizning zamonaviy dasturchi bo'lib yetishishiga professional yondashamiz.",
      btnCourses: "Kurslarni ko'rish", btnContact: "Konsultatsiya olish", btnPortal: "LMS Portaliga kirish",
      statsGraduates: "Bitiruvchilar", statsPlacement: "Ishga joylashish", statsPartners: "Hamkorlar", statsCourses: "Kurslar",
      trustedBy: "Ishonch bildirgan kompaniyalar",
      coursesTitle: "IT yo'nalishlar", coursesDesc: "O'quv yo'nalishlarimiz noldan boshlovchilar uchun amaliy mashg'ulotlar, xalqaro sertifikatlar va ishga joylashtirish kafolatini o'z ichiga oladi.",
      servicesTitle: "Enterprise yechimlar", servicesDesc: "Brain IT shunchaki akademiya emas — bu biznes jarayonlarini avtomatlashtiradigan professional jamoa.",
      servicesBadge: "IT Kompaniya",
      aiTitle: "AI bilan kuchaytirilgan platforma", aiDesc: "Sun'iy intellekt texnologiyalari yordamida ta'lim va biznesingizni yangi bosqichga olib chiqing.",
      aiBadge: "AI Platform",
      numberTitle: "Raqamlarda Brain IT", numberDesc: "Natijalar o'zi gapiradi.",
      portfolioTitle: "Real Loyihalar", portfolioDesc: "Hayotga tatbiq etilgan ishlanmalarimiz va muvaffaqiyatli case study-lar.",
      internTitle: "Stajirovka Dasturi", internDesc: "Eng yaxshi o'quvchilarimiz Brain IT kompaniyasida real loyihalar ustida ishlash va tajriba orttirish imkoniyatiga ega bo'ladilar.",
      internBadge: "Internship",
      teamHeader: "Bizning Jamoa", teamSub: "Har bir a'zo o'z sohasida tajribali va real enterprise loyihalarni yetaklashga tayyor.",
      testimonialTitle: "Muvaffaqiyat hikoyalari", testimonialDesc: "O'quvchilarimizning hayotini o'zgartirib yuborgan tajribalar.",
      contactHeader: "Kursga yoki konsultatsiyaga yoziling",
      contactSub: "Arizangizni qoldiring — tez orada menejerlarimiz siz bilan bog'lanishadi.",
      formName: "Ismingiz", formPhone: "Telefon raqamingiz", formEmail: "Elektron pochta (ixtiyoriy)",
      formService: "Kurs yoki xizmat", submitButton: "Yuborish",
      thankYouTitle: "Rahmat! Arizangiz qabul qilindi.",
      thankYouBody: "Tez orada menejerlarimiz siz bilan bog'lanishadi.",
      btnRegisterNow: "Ro'yxatdan o'tish", priceLabel: "Narxi", durationLabel: "Davomiyligi",
      modalCurriculumLabel: "Kurs dasturi:", detailButton: "Batafsil",
      footerDesc: "IT ta'lim va enterprise dasturiy yechimlar platformasi. Termiz shahri, Surxondaryo.",
      footerLinks: "Havolalar", footerSocial: "Ijtimoiy tarmoqlar",
      footerText: "© 2026 Brain IT Academy & Co. Barcha huquqlar himoyalangan.",
      footerContact: "Termiz shahri, Yubileyny · +998 99 067 00 66",
      realProjectsCount: "Real loyihalar", activeProjects: "Faol loyihalar", clientsCount: "Mijozlar",
      feature1: "Multi-tenant arxitektura", feature2: "Face ID davomat", feature3: "Docker production",
      service1Title: "Veb Dasturlash", service1Desc: "React, Next.js, Django, Node.js bilan zamonaviy platformalar.",
      service2Title: "Mobil Ilovalar", service2Desc: "iOS va Android uchun yuqori darajali native ilovalar.",
      service3Title: "Enterprise Infratuzilma", service3Desc: "Multi-tenant tizimlar, Docker, server integratsiyalari.",
      teamTitle: "Bizning jamoa", teamDesc: "Mutaxassislar.",
      projectsTitle: "Loyihalar", projectsDesc: "Real ishlanmalar.",
      contactTitle: "Bog'lanish", contactDesc: "Aloqa.",
      projectStatsHeader: "Statistika", projectStatsSub: "Raqamlar.", contactHeader2: "Bog'lanish",
      contactSub2: "Aloqa.",
    },
    ru: {
      navCourses: 'Курсы', navServices: 'Решения', navContact: 'Контакты', navPortal: 'Войти в LMS',
      heroBadge: 'Brain IT Ecosystem', heroEyebrow: 'Будущее только с IT!',
      heroTitle: 'Станьте разработчиком с нуля!', heroTitleAccent: ' Профессионально.',
      heroText: 'Создаём программы для автоматизации бизнеса. Помогаем детям стать программистами.',
      btnCourses: 'Смотреть курсы', btnContact: 'Консультация', btnPortal: 'Войти в LMS',
      statsGraduates: 'Выпускников', statsPlacement: 'Трудоустройство', statsPartners: 'Партнёры', statsCourses: 'Курсов',
      trustedBy: 'Нам доверяют компании',
      coursesTitle: 'IT направления', coursesDesc: 'Курсы с практикой, AI-проверкой и реальными проектами.',
      servicesTitle: 'Enterprise решения', servicesDesc: 'Brain IT — профессиональная команда для автоматизации бизнеса.',
      servicesBadge: 'IT Компания',
      aiTitle: 'AI-платформа', aiDesc: 'Выводим образование и бизнес на новый уровень с AI.',
      aiBadge: 'AI Platform',
      numberTitle: 'Brain IT в цифрах', numberDesc: 'Результаты говорят сами за себя.',
      portfolioTitle: 'Реальные проекты', portfolioDesc: 'Реализованные решения и кейсы.',
      internTitle: 'Программа стажировки', internDesc: 'Лучшие студенты работают над реальными проектами в Brain IT.',
      internBadge: 'Стажировка',
      teamHeader: 'Наша команда', teamSub: 'Каждый участник ведёт реальные enterprise-проекты.',
      testimonialTitle: 'Истории успеха', testimonialDesc: 'Опыт, изменивший жизнь наших студентов.',
      contactHeader: 'Запишитесь на курс', contactSub: 'Оставьте заявку — менеджеры свяжутся с вами.',
      formName: 'Ваше имя', formPhone: 'Телефон', formEmail: 'Email (необязательно)',
      formService: 'Курс или услуга', submitButton: 'Отправить',
      thankYouTitle: 'Спасибо! Заявка принята.', thankYouBody: 'Менеджеры скоро свяжутся с вами.',
      btnRegisterNow: 'Записаться', priceLabel: 'Цена', durationLabel: 'Длительность',
      modalCurriculumLabel: 'Программа курса:', detailButton: 'Подробнее',
      footerDesc: 'IT образование и enterprise решения. г. Термез, Сурхандарья.',
      footerLinks: 'Ссылки', footerSocial: 'Соцсети',
      footerText: '© 2026 Brain IT Academy. Все права защищены.',
      footerContact: 'г. Термез, Юбилейный · +998 99 067 00 66',
      realProjectsCount: 'Проектов', activeProjects: 'Активных', clientsCount: 'Клиентов',
      feature1: 'Мультиарендная архитектура', feature2: 'Face ID посещаемость', feature3: 'Docker production',
      service1Title: 'Веб-разработка', service1Desc: 'React, Next.js, Django, Node.js платформы.',
      service2Title: 'Мобильные приложения', service2Desc: 'Надёжные iOS и Android приложения.',
      service3Title: 'Enterprise инфраструктура', service3Desc: 'Мультиарендные системы, Docker интеграции.',
      teamTitle: 'Команда', teamDesc: 'Эксперты.', projectsTitle: 'Проекты', projectsDesc: 'Кейсы.',
      contactTitle: 'Контакты', contactDesc: 'Связь.',
      projectStatsHeader: 'Статистика', projectStatsSub: 'Цифры.', contactHeader2: 'Связь', contactSub2: 'Контакт.',
    },
    en: {
      navCourses: 'Courses', navServices: 'Solutions', navContact: 'Contact', navPortal: 'Enter LMS Portal',
      heroBadge: 'Brain IT Ecosystem', heroEyebrow: 'The Future is IT!',
      heroTitle: 'Go from zero to developer.', heroTitleAccent: ' Professionally.',
      heroText: 'We build software for business automation. We help your children become professional programmers.',
      btnCourses: 'View Courses', btnContact: 'Get Consultation', btnPortal: 'Enter LMS Portal',
      statsGraduates: 'Graduates', statsPlacement: 'Placement Rate', statsPartners: 'Partners', statsCourses: 'Courses',
      trustedBy: 'Trusted by companies',
      coursesTitle: 'IT Directions', coursesDesc: 'Practical courses with AI checks, real projects and certificates.',
      servicesTitle: 'Enterprise Solutions', servicesDesc: 'Brain IT is more than an academy — a professional software team.',
      servicesBadge: 'IT Company',
      aiTitle: 'AI-Powered Platform', aiDesc: 'Bring your education and business to the next level with AI.',
      aiBadge: 'AI Platform',
      numberTitle: 'Brain IT in Numbers', numberDesc: 'Results speak for themselves.',
      portfolioTitle: 'Real Projects', portfolioDesc: 'Delivered enterprise solutions and case studies.',
      internTitle: 'Internship Program', internDesc: 'Top students work on real projects inside Brain IT company.',
      internBadge: 'Internship',
      teamHeader: 'Our Team', teamSub: 'Every member is ready to lead real enterprise projects.',
      testimonialTitle: 'Success Stories', testimonialDesc: 'Experiences that changed lives of our students.',
      contactHeader: 'Register for a Course', contactSub: 'Leave your request — managers will contact you soon.',
      formName: 'Your Name', formPhone: 'Phone Number', formEmail: 'Email (Optional)',
      formService: 'Course or Service', submitButton: 'Submit',
      thankYouTitle: 'Thank you! Request received.', thankYouBody: 'Our managers will contact you soon.',
      btnRegisterNow: 'Register Now', priceLabel: 'Price', durationLabel: 'Duration',
      modalCurriculumLabel: 'Course Curriculum:', detailButton: 'Learn More',
      footerDesc: 'IT education and enterprise software solutions. Termez, Surkhandarya, Uzbekistan.',
      footerLinks: 'Links', footerSocial: 'Social',
      footerText: '© 2026 Brain IT Academy & Co. All rights reserved.',
      footerContact: 'Termez, Yubileyny · +998 99 067 00 66',
      realProjectsCount: 'Projects', activeProjects: 'Active', clientsCount: 'Clients',
      feature1: 'Multi-tenant architecture', feature2: 'Face ID attendance', feature3: 'Docker production',
      service1Title: 'Web Development', service1Desc: 'React, Next.js, Django, Node.js platforms.',
      service2Title: 'Mobile Apps', service2Desc: 'High-quality native iOS and Android apps.',
      service3Title: 'Enterprise Infrastructure', service3Desc: 'Multi-tenant systems, Docker integrations.',
      teamTitle: 'Team', teamDesc: 'Experts.', projectsTitle: 'Projects', projectsDesc: 'Case studies.',
      contactTitle: 'Contact', contactDesc: 'Reach us.',
      projectStatsHeader: 'Stats', projectStatsSub: 'Numbers.', contactHeader2: 'Contact', contactSub2: 'Reach us.',
    },
  };
  const t = translations[language];

  /* ── DATA ── */
  const directions = [
    { icon: Monitor, title: 'Kompyuter savodxonligi', color: '#2563EB' },
    { icon: Cpu, title: 'Suniy intellekt', color: '#059669' },
    { icon: BookOpen, title: 'IT Foundation', color: '#06B6D4' },
    { icon: Code, title: 'Frontend dasturlash', color: '#2563EB' },
    { icon: Server, title: 'Backend dasturlash', color: '#059669' },
    { icon: ShieldCheck, title: 'Kiber xavfsizlik', color: '#06B6D4' },
    { icon: Sparkles, title: 'Roboto-texnika', color: '#2563EB' },
    { icon: Smile, title: 'IT Kids', color: '#F59E0B' },
    { icon: Globe2, title: 'English for IT', color: '#10B981' },
    { icon: Calculator, title: 'Math for IT', color: '#EC4899' },
  ];

  const team = [
    {
      id: 't1', name: 'Jahongir Omonov', role: 'Senior Fullstack Dasturchi',
      bio: "Python, Django va Linux server infratuzilmalari bo'yicha senior darajadagi mutaxassis. Backend arxitekturadan tortib DevOps jarayonlarigacha keng qamrovli tajribaga ega, murakkab enterprise tizimlarni loyihalaydi va joriy etadi.",
      exp: 7, accent: '#f97316',
      skills: ['Python', 'Django', 'Linux', 'PostgreSQL', 'Docker', 'Nginx', 'REST API', 'CI/CD'],
      avatar: '/jahongir.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't2', name: 'Adham Xoliqov', role: "Backend Yordamchi O'qituvchi",
      bio: "Jahongir Omonovning yordamchisi sifatida Python, Django, Linux va PostgreSQL bo'yicha o'quvchilarga amaliy bilim beradi. Server infratuzilmalari va REST API ishlab chiqishda mustaqil tajribaga ega, har bir o'quvchiga individual yondashuvi bilan ajralib turadi.",
      exp: 3, accent: '#10b981',
      skills: ['Python', 'Django', 'Linux', 'PostgreSQL', 'Docker', 'Nginx', 'REST API', 'CI/CD'],
      avatar: '/adham.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't3', name: 'Beksulton Abduraxmonov', role: 'Frontend Dasturchi',
      bio: "React, Next.js va TypeScript texnologiyalari asosida zamonaviy veb ilovalar yaratishda 4+ yillik tajribaga ega. Foydalanuvchi interfeysi va sifatli frontend arxitekturani ishlab chiqishga ixtisoslashgan, responsive va tezkor UI yechimlar ustasi.",
      exp: 4, accent: '#06b6d4',
      skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Git', 'Figma', 'Redux'],
      avatar: '/beksulton.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't4', name: 'Avazbek Jumanazarov', role: 'Backend Dasturchi',
      bio: "Python, Django, REST Framework va PostgreSQL asosida kuchli backend tizimlar quradi. 2+ yil tajriba, 10+ real yirik loyihalarda ishlagan, murakkab API arxitekturalari va asinxron vazifalarni boshqarishda katta tajribaga ega.",
      exp: 2, accent: '#ec4899',
      skills: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Docker', 'Celery', 'Redis', 'JWT'],
      avatar: '/avazbek-photo.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't5', name: 'Umid Mamatraximov', role: 'Fullstack Dasturchi',
      bio: "LIMSA va GREATSOFT kabi yirik kompaniyalarda 5+ yil davomida faoliyat yuritib, frontend va backend texnologiyalar bo'yicha chuqur tajriba orttirdi. To'liq stack bo'yicha keng qamrovli bilimga ega real enterprise mutaxassisi.",
      exp: 5, accent: '#22c55e',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'JavaScript'],
      avatar: '/umid.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't6', name: 'Behruz Karimov', role: "Kompyuter Savodxonligi Ustozi",
      bio: "10+ yil mobaynida yuzlab o'quvchilarga kompyuter savodxonligi, MS Office va asosiy IT ko'nikmalarini o'rgatib kelmoqda. Sabr-toqatli va izchil o'qitish uslubi bilan ajralib turadi, har bir o'quvchi bilim olishiga ishonch hosil qiladi.",
      exp: 10, accent: '#10b981',
      skills: ['MS Office', 'Kompyuter asoslari', 'Windows', 'Internet', 'Photoshop'],
      avatar: '/behruz.jpg',
      photoStyle: { objectPosition: 'center 5%', transform: 'scale(1.08)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.15) brightness(1.05) saturate(1.1)' },
    },
    {
      id: 't7', name: 'Qurbonov Husniddin', role: 'Matematika Ustozi',
      bio: "DTM & Milliy sertifikat bo'yicha davlat oliy maktablariga 100% tayyorgarlik, SAT Math orqali xalqaro universitetlar uchun, Prezident va Al-Xorazmiy maktablari tanlovi dasturi, hamda kelajak dasturchilari uchun Math for IT yo'nalishi.",
      exp: 5, accent: '#f59e0b',
      skills: ['DTM Matematika', 'SAT Math', 'Milliy Sertifikat', 'Math for IT', 'Mantiqiy Fikrlash', 'Chuqurlashtirilgan Dastur'],
      avatar: '/husniddin.jpg',
      photoStyle: { objectFit: 'contain', objectPosition: 'center top', photoBg: '#f0f2f5', transform: 'scale(1.0)', transformOrigin: '50% 0%', vignetteY: '35%', filter: 'contrast(1.1) brightness(1.0) saturate(1.05)' },
    },
  ];

  const testimonials = [
    { name: 'Beksulton Abdurakhmanov', role: 'Frontend Developer at Brain IT Academy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', text: "Brain IT da Frontend kursini tugatgach, to'g'ridan-to'g'ri akademiyada ish boshlash imkonim bo'ldi. Real loyihalar ustida ishlash menga amaliy ko'nikma va kuchli ishonch berdi.", stars: 5 },
    { name: 'Avazbek Jummanazarov', role: 'Backend Developer at Brain IT Academy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', text: "Backend yo'nalishini tanlaganim hayotimdagi eng to'g'ri qaror bo'ldi. Brain IT da o'rgangan texnologiyalar bilan hozir real API va tizimlar yaratyapman — bu tajriba bebaho.", stars: 5 },
    { name: 'Jasur Mirzayev', role: 'Full Stack Developer at Brain IT Academy', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face', text: "6 oyda Frontend va Backend ni birga o'rgandim. Endi o'zim mustaqil loyiha olib boraman. Brain IT faqat dasturlash emas, professional fikrlashni o'rgatadi.", stars: 5 },
  ];

  const services = [
    { icon: Code, title: 'Veb Dasturlash', desc: 'React, Next.js, Django, Node.js bilan enterprise platformalar.', color: '#2563EB' },
    { icon: Smartphone, title: 'Mobil Ilovalar', desc: 'iOS va Android uchun Flutter asosida premium ilovalar.', color: '#059669' },
    { icon: Brain, title: 'AI Yechimlar', desc: "Biznes jarayonlarini sun'iy intellekt bilan avtomatlashtirish.", color: '#06B6D4' },
    { icon: Shield, title: 'Kiber Xavfsizlik', desc: "Tizimlaringizni himoyalash va zaifliklarni bartaraf etish.", color: '#F59E0B' },
    { icon: Cloud, title: 'Cloud & DevOps', desc: 'Docker, Kubernetes, CI/CD pipeline va cloud deployment.', color: '#10B981' },
    { icon: Layers, title: 'UI/UX Design', desc: 'Figma asosida premium, conversion-optimized dizayn tizimlar.', color: '#EC4899' },
  ];

  const aiFeatures = [
    { icon: Bot, title: 'AI Assistant', desc: "O'quv jarayonida shaxsiy AI mentor yordami." },
    { icon: BarChart3, title: 'Kurs tavsiyalari', desc: "AI asosida shaxsiy o'quv yo'lini tuzish." },
    { icon: MessageSquare, title: 'Kod reviewer', desc: "Topshiriqlaringizni AI avtomatik tekshiradi." },
    { icon: Rocket, title: 'Loyiha generator', desc: "AI bilan real loyiha g'oyalari va kod skeletlari." },
  ];

  const internSteps = [
    { num: '01', icon: Award, title: "Kursni tugating", desc: "Har qanday yo'nalishda 80% dan yuqori baho bilan bitirish." },
    { num: '02', icon: Layers, title: "Portfolio loyiha", desc: "Real IT muammosini hal qiluvchi loyiha yarating." },
    { num: '03', icon: Users, title: "Jamoa bilan ishlash", desc: "Brain IT kompaniyasida haqiqiy loyihalarda ishlang." },
  ];

  const directionToCourseMap: Record<string, string> = {
    'Kompyuter savodxonligi': 'c1', 'Suniy intellekt': 'c4', 'IT Foundation': 'c1',
    'Frontend dasturlash': 'c2', 'Backend dasturlash': 'c3', 'Kiber xavfsizlik': 'c5',
    'Roboto-texnika': 'c1', 'IT Kids': 'c1', 'English for IT': 'c1', 'Math for IT': 'c1',
  };
  const openCourseByKey = (key: string) => {
    const id = directionToCourseMap[key];
    const course = courses.find(c => c.id === id) || courses[0] || null;
    if (course) setSelectedCourse(course as Course);
  };

/* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div
      className={`relative min-h-screen flex flex-col font-sans select-none scroll-smooth overflow-x-hidden transition-colors duration-300 ${darkMode ? 'dark text-white bg-[#09090b]' : 'text-slate-900 bg-slate-50'}`}
    >
      {/* ──────────────── MODULAR NAV ──────────────── */}
      <Navbar
        onEnterPortal={onEnterPortal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      {/* ──────────────── MODULAR HERO (Contains background video) ──────────────── */}
      <Hero
        onEnterPortal={onEnterPortal}
        onScrollToContact={() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        t={t}
      />

      {/* ──────────────── EDUTIZIM PARTNERS STRIP ("ISHONCHLI HAMKORLARIMIZ") ──────────────── */}
      <section className="py-12 px-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d14] relative z-10">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>O'ZBEKISTONDAGI ISHONCHLI HAMKORLARIMIZ</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Bugungi kunda har kuni <span className="text-teal-600 dark:text-teal-400 font-bold">200+ ta'lim markazlari</span> dars va davomat jarayonlarini Brain IT CRM orqali nazorat qilmoqda
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-3">
            {[
              { name: "Target School", label: "INTERNATIONAL ACADEMY", color: "from-emerald-600 to-cyan-500" },
              { name: "Imperial Academy", label: "IT & LANGUAGES", color: "from-amber-500 to-orange-500" },
              { name: "Registon", label: "O'QUV MARKAZI", color: "from-red-600 to-rose-500" },
              { name: "Grand Edu", label: "BUSINESS SCHOOL", color: "from-emerald-600 to-emerald-500" },
              { name: "Finlite", label: "FINANCE ACADEMY", color: "from-emerald-600 to-teal-500" },
              { name: "Nexus School", label: "DIGITAL CAMPUS", color: "from-emerald-600 to-teal-500" },
            ].map((partner, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center gap-1.5 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                  {partner.name[0]}
                </div>
                <span className="font-heading font-black text-sm text-slate-800 dark:text-white leading-tight">{partner.name}</span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{partner.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── EDUTIZIM 2-SIDE ANIMATED FEATURE 1: SUPERAPP (LEFT & RIGHT) ──────────────── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE: TEXT ANIMATING IN FROM LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider">
              <span>O'QUVCHILAR & OTA-ONALAR • CLIENT SUPERAPP</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white">
              Brendingiz ostida o'quvchi va ota-onalar Superilova tizimi
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Biz har bir o'quv markaziga shaxsiy brend (logotip va nom) ostida o'quvchilar kabineti, dars jadvali, uy vazifasi va Click/Payme o'rnatilgan mobil ilovani taqdim etamiz. Bu o'quv markazingiz nufuzini karrasiga oshiradi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: "To'liq shaffoflik", desc: "Balans va to'lovlar tarixi shaffof kuzatiladi" },
                { title: "Virtual o'quv kundaligi", desc: "Baholar va topshiriqlarni yuklash tizimi" },
                { title: "Onlayn to'lov Click & Payme", desc: "Uyda o'tirib ota-onalar tomonidan tezkor to'lov" },
                { title: "Kutubxona & Videodarslar", desc: "PDF materiallar va video darslar arxivi" },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE: MOCKUP ANIMATING IN FROM RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-br from-teal-600/10 via-emerald-600/10 to-cyan-500/10 border border-teal-500/20 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Salom, Dostonbek</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Balans: +120 Coin</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-600 dark:text-teal-300">Superapp</span>
              </div>
              <div className="py-5 space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Bugungi Dars</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">18:00 - 19:30</span>
                  </div>
                  <div className="font-heading font-black text-base text-slate-900 dark:text-white">Frontend Dasturlash (React)</div>
                  <div className="text-xs text-slate-500 mt-1">Ustoz: Jahongir Omonov • 402-xona</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">95 ball</div>
                    <div className="text-xs text-slate-500 font-semibold">So'nggi vazifa</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="font-black text-lg text-amber-600 dark:text-amber-400">To'langan</div>
                    <div className="text-xs text-slate-500 font-semibold">Iyul oyi holati</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── EDUTIZIM 2-SIDE ANIMATED FEATURE 2: AI FACE ID DAVOMAT (RIGHT & LEFT) ──────────────── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10 overflow-hidden border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE: CAMERA SCANNER MOCKUP ANIMATING IN FROM LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="w-full max-w-md mx-auto rounded-3xl p-6 bg-slate-900 dark:bg-zinc-950 border border-emerald-500/30 shadow-xl relative text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">AI Face ID & QR Scanner</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">● LIVE CAMERA</span>
              </div>
              <div className="my-5 aspect-video rounded-2xl bg-black relative overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
                <div className="absolute inset-4 border-2 border-dashed border-emerald-500/50 rounded-xl flex items-center justify-center">
                  <Camera className="w-12 h-12 text-emerald-400/80" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Sardor Ahmedov aniqlandi</span>
                  </div>
                  <span className="text-emerald-300 font-mono font-bold">14:58:12</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: TEXT ANIMATING IN FROM RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span>DAVOMAT & XAVFSIZLIK • AI FACE ID</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white">
              AI Face ID va QR-kod orqali 1 soniyada avtomatik davomat
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              O'quvchi markazga kirishi bilan uning yuzi yoki QR kodi avtomat aniqlanadi hamda ota-onasining Telegram botiga va mobil ilovasiga rasmli SMS xabarnoma yuboriladi.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { title: "99.9% aniqlikda yuzni tanish", desc: "Hikvision va AI kameralar orqali aldamasdan aniq qayd etadi" },
                { title: "Ota-onaga rasmli Telegram SMS", desc: "Farzandi o'quv markazga kelgani va ketgani sekundiga bildiriladi" },
                { title: "Ustozlar davomati va maosh nazorati", desc: "Ustozlarning darsga kelish vaqti avtomatik maosh hisobiga bog'lanadi" },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── EDUTIZIM 2-SIDE ANIMATED FEATURE 3: MOLIYA & KASSA (LEFT & RIGHT) ──────────────── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10 overflow-hidden border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE: TEXT ANIMATING IN FROM LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span>MOLIYA & KASSA • 100% SHAFFOF BOSHQARUV</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white">
              Oylik to'lovlar, ustoz maoshi va kassa aylanmasini to'liq nazorat qiling
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Click, Payme, Uzum va naqd to'lovlar avtomatik yagona hisobotga tushadi. Qarzdor o'quvchilar aniqlanib, ustozlar maoshi (Fix / Foiz / Soatbay) aniq hisoblab beriladi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: "Avans & Qarzdorlik hisobi", desc: "Qisman to'lov va avanslar aniq saqlanadi" },
                { title: "Ustoz maoshi avtomatika", desc: "To'langan va qoldiq maoshlar aniq hisoblanadi" },
                { title: "Click & Payme integratsiya", desc: "To'lov qilinganda avtomatik status o'zgaradi" },
                { title: "Bir klik bilan PDF hisobot", desc: "Moliya rahbariyati uchun tezkor analitika" },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE: FINANCE ANALYTICS MOCKUP ANIMATING IN FROM RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 dark:bg-zinc-950 border border-emerald-500/30 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm text-emerald-400">Moliya Aylanmasi (Iyul)</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">+48.2% o'sish</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JAMI KIRIM</div>
                  <div className="font-heading font-black text-xl text-emerald-400 mt-1">48,500,000 UZS</div>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">USTOZ MAOSH</div>
                  <div className="font-heading font-black text-xl text-emerald-300 mt-1">18,200,000 UZS</div>
                </div>
              </div>
              {/* So'nggi tranzaksiyalar ro'yxati (B1: jonli mini-preview) */}
              <div className="pt-2 space-y-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">So'nggi to'lovlar</div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-white">Sardor Alimov • Python</div>
                    <div className="text-[10px] text-slate-400">Bugun 14:20</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">+650,000 UZS</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">To'landi</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-white">Malika Karimova • IELTS</div>
                    <div className="text-[10px] text-slate-400">Bugun 11:05</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">+500,000 UZS</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Avtomat</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────── EDUTIZIM TESTIMONIALS STRIP ("MIJOZLARIMIZ FIKRI") ──────────────── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200 dark:border-white/10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
            <span>MIJOZLARIMIZ FIKRI</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-slate-900 dark:text-white">
            O'zbekistonning eng sara o'quv markazlari bizga ishonishadi
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Biznes tizimlashganida o'sish va sifat yuksalishni boshlaydi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              stat: "+58% davomat",
              quote: "Brain IT CRM'ga o'tganimizdan keyin moliya va davomat bitta tizimga jamlandi. Endi filiallarni real vaqtda nazorat qilyapmiz.",
              author: "Avazbek To'lovov",
              role: "Rahbar • Registon O'quv Markazi",
              color: "bg-emerald-600"
            },
            {
              stat: "+48% o'sish",
              quote: "O'quvchilar davomati va to'lovlar avtomatlashgani tufayli ma'muriyat ishi sezilarli yengillashdi. Qog'ozbozlik 70% ga kamaydi.",
              author: "Bahodir Mamajonov",
              role: "Rahbar • Imperial Academy",
              color: "bg-teal-600"
            },
            {
              stat: "-70% qog'ozbozlik",
              quote: "Lidlar va sotuv voronkasi orqali har bir mijoz e'tiborda. Yangi o'quvchilar soni keskin o'sishni boshladi.",
              author: "Nilufar Sotirovo",
              role: "Direktor • Target School",
              color: "bg-emerald-600"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">★★★★★</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{item.stat}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{item.quote}"</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className={`w-10 h-10 rounded-full ${item.color} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                  {item.author[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{item.author}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ──────────────── COURSES / DIRECTIONS ──────────────── */}
      <section id="courses" className="py-14 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10">
        <Reveal className="space-y-8">
          <div className="text-center space-y-4">
            <motion.div variants={fadeIn}><Badge color="#10B981"><BookOpen className="h-3.5 w-3.5" />IT Academy</Badge></motion.div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 dark:text-white drop-shadow-sm">{t.coursesTitle}</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">{t.coursesDesc}</p>
          </div>
          <motion.div variants={staggerFast} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {directions.map((dir, i) => {
              const Icon = dir.icon;
              return (
                <motion.button key={i} variants={fadeUp}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -6,
                    borderColor: `${dir.color}aa`,
                    boxShadow: `0 12px 30px -10px ${dir.color}50`
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openCourseByKey(dir.title)}
                  className="group flex flex-col items-center justify-center gap-4.5 p-6.5 text-center transition-all duration-350 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  {/* Subtle background glow representing the theme color */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${dir.color} 0%, transparent 70%)` }}
                  />

                  {/* Icon Wrapper with Custom Color theme */}
                  <div 
                    className="h-13 w-13 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{ 
                      background: `${dir.color}15`, 
                      border: `1.5px solid ${dir.color}35`,
                      boxShadow: `0 0 15px -3px ${dir.color}25`
                    }}
                  >
                    <Icon className="h-6.5 w-6.5 transition-transform duration-300 group-hover:scale-110" style={{ color: dir.color }} />
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="text-[13.5px] font-bold leading-snug text-slate-900 dark:text-white/90 transition-colors group-hover:text-emerald-600 dark:group-hover:text-white">{dir.title}</p>
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: dir.color }}>
                      0 dan boshlash
                    </span>
                  </div>

                  {/* Tiny glowing dot at the bottom of the card on hover */}
                  <div 
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: dir.color, boxShadow: `0 0 8px ${dir.color}` }}
                  />
                </motion.button>
              );
            })}
          </motion.div>
        </Reveal>
      </section>

      {/* ──────────────── SERVICES ──────────────── */}
      <section id="services" className="py-14 px-6 lg:px-16 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <Reveal className="space-y-8">
            <div className="space-y-4">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Rocket className="h-3.5 w-3.5" />{t.servicesBadge}</Badge></motion.div>
              <SectionHead title={t.servicesTitle} sub={t.servicesDesc} center={false} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((srv, i) => {
                const Icon = srv.icon;
                return (
                  <motion.div key={i} variants={fadeUp}
                    onClick={() => onEnterPortal()}
                    className="group rounded-2xl p-8 cursor-pointer transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg"
                  >
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: `${srv.color}18` }}>
                      <Icon className="h-6 w-6" style={{ color: srv.color }} />
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{srv.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{srv.desc}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: srv.color }}>
                      {t.detailButton} <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── AI PLATFORM ──────────────── */}
      <section className="py-14 px-6 lg:px-16 relative overflow-hidden">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #059669, transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center space-y-4 mb-8">
              <motion.div variants={fadeIn}><Badge color="#059669"><Brain className="h-3.5 w-3.5" />{t.aiBadge}</Badge></motion.div>
              <SectionHead title={t.aiTitle} sub={t.aiDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div key={i} variants={fadeUp} onClick={() => onEnterPortal()} className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-extrabold text-lg mb-2 text-slate-900 dark:text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── NUMBERS ──────────────── */}
      <section className="py-12 px-6 border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-8 space-y-4">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Star className="h-3.5 w-3.5" />{t.numberTitle}</Badge></motion.div>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-300 text-sm font-medium">{t.numberDesc}</motion.p>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: "Talabalar", to: 1200, suffix: '+', color: '#10B981' },
                { label: "Kurslar", to: 10, suffix: '+', color: '#10B981' },
                { label: "O'qituvchilar", to: 8, suffix: '', color: '#10B981' },
                { label: "Loyihalar", to: projects.length, suffix: '+', color: '#10B981' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="rounded-2xl py-8 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                  <p className="text-4xl font-black mb-2" style={{ color: s.color }}>
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300 font-bold">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── PORTFOLIO ──────────────── */}
      <section id="projects" className="py-14 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-8">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Layers className="h-3.5 w-3.5" />Portfolio</Badge></motion.div>
              <SectionHead title={t.portfolioTitle} sub={t.portfolioDesc} />
            </div>
            <motion.div variants={stagger} className="flex flex-wrap justify-center gap-5">
              {projects.slice(0, 6).map((project: Project) => (
                <div key={project.id} className="group rounded-2xl p-6 transition-all duration-300 cursor-default w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] hover:-translate-y-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-bold"
                      style={{ color: project.status === 'completed' ? '#10B981' : project.status === 'in_progress' ? '#2563EB' : '#F59E0B' }}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">{project.progress}%</span>
                  </div>
                  <h4 className="font-extrabold text-lg mb-1 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{project.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">{project.client}</p>
                  <div className="h-1 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full transition-all duration-700 bg-emerald-500"
                      style={{ width: `${project.progress}%` }} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                    <span>{project.tasks.length} ta vazifa</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {project.progress}% tayyor
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── INTERNSHIP ──────────────── */}
      <section className="py-14 px-6 lg:px-16 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-8">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Rocket className="h-3.5 w-3.5" />{t.internBadge}</Badge></motion.div>
              <SectionHead title={t.internTitle} sub={t.internDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {internSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} variants={fadeUp}
                    className="relative rounded-2xl p-8 text-center hover:-translate-y-2 transition-all bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                    {i < internSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2 text-slate-400">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                    <span className="text-5xl font-black opacity-15" style={{ color: '#10B981' }}>{step.num}</span>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto my-4"
                      style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h4 className={`font-extrabold text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── TEAM FILMSTRIP ──────────────── */}
      <section id="team" className="py-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-16 mb-6">
          <Reveal>
            <div className="text-center space-y-4">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Users className="h-3.5 w-3.5" />{t.teamHeader}</Badge></motion.div>
              <SectionHead title={t.teamHeader} sub={t.teamSub} />
            </div>
          </Reveal>
        </div>

        {/* Full-width filmstrip */}
        <div className="relative overflow-hidden">
          <div className="filmstrip-track">
            {[...team, ...team].map((member, i) => (
              <div key={i} className="shrink-0 w-80 mx-3 group/card" style={{ height: '560px' }}>
                <div className="rounded-2xl overflow-hidden h-full flex flex-col bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm" style={{
                  border: `1.5px solid ${member.accent}44`,
                }}>
                  <div className="h-1.5 shrink-0" style={{ background: `linear-gradient(90deg,${member.accent},${member.accent}33)` }} />
                  <div className="relative shrink-0 overflow-hidden" style={{ height: '280px', background: (member.photoStyle as any).photoBg || 'transparent' }}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full"
                      style={{
                        objectFit: (member.photoStyle as any).objectFit || 'cover',
                        objectPosition: member.photoStyle.objectPosition,
                        transform: member.photoStyle.transform,
                        transformOrigin: member.photoStyle.transformOrigin,
                        filter: member.photoStyle.filter,
                        transition: 'transform 0.5s ease',
                      }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
                    />
                    <div className="absolute inset-0" style={{ background: darkMode ? 'linear-gradient(to top,#0d1117 0%,transparent 60%)' : 'linear-gradient(to top,#ffffff 0%,transparent 60%)' }} />
                  </div>
                  <div className="p-4 flex flex-col flex-1 overflow-hidden">
                    <div className="shrink-0 mb-2">
                      <p className={`font-heading font-black text-lg leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: member.accent }}>{member.role}</p>
                    </div>
                    <div className="mb-2" style={{ minHeight: '56px' }}>
                      <p className={`text-xs leading-relaxed line-clamp-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{member.bio}</p>
                      <button
                        onClick={() => setTeamModalId(member.id)}
                        className="text-[10px] font-bold mt-0.5 hover:underline transition-all"
                        style={{ color: member.accent }}
                      >
                        Ko'proq o'qish →
                      </button>
                    </div>
                    <div className="shrink-0 flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1.5">{member.exp}+ yil tajriba</span>
                    </div>
                    <div className="shrink-0 flex flex-wrap gap-1.5 mb-2">
                      {member.skills.slice(0, 4).map((skill: string) => (
                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${member.accent}18`, color: member.accent, border: `1px solid ${member.accent}38` }}>
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 4 && (
                        <button
                          onClick={() => setTeamModalId(member.id)}
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${member.accent}18`, color: member.accent, border: `1px solid ${member.accent}38` }}>
                          +{member.skills.length - 4} ko'proq
                        </button>
                      )}
                    </div>
                    <div className="shrink-0 mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] tracking-widest font-bold text-slate-600">BRAIN IT</span>
                      <span className="text-xs font-black" style={{ color: `${member.accent}88` }}>◈</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section className="py-14 px-6 lg:px-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-8">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Star className="h-3.5 w-3.5" />{t.testimonialTitle}</Badge></motion.div>
              <SectionHead title={t.testimonialTitle} sub={t.testimonialDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t2, i) => (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -5 }}
                  className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t2.stars }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 text-slate-600 dark:text-slate-300">"{t2.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <img src={t2.avatar} alt={t2.name} className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t2.name}</p>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{t2.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── FAQ ACCORDION (B6: Ko'p uchraydigan savollar) ──────────────── */}
      <section className="py-14 px-6 lg:px-16 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-10">
              <motion.div variants={fadeIn}><Badge color="#10B981"><MessageSquare className="h-3.5 w-3.5" />Ko'p uchraydigan savollar</Badge></motion.div>
              <SectionHead title="Savol va Javoblar (FAQ)" sub="Markazimiz haqida eng ko'p beriladigan savollar va ularning aniq javoblari." />
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Darslar qanday formatda va qachon bo'lib o'tadi?",
                  a: "Darslar haftada 3 kun 2 soatdan oflayn formatda o'tadi. Barcha darslar videoyozuv sifatida LMS tizimiga yuklanadi va 24/7 AI mentor yordami taqdim etiladi."
                },
                {
                  q: "Kursni tugatgach ishga joylashish imkoniyati qanday?",
                  a: "Eng yaxshi bitiruvchilar Brain IT kompaniyamizda real loyihalarga stajirovka va to'g'ridan-to'g'ri ishga qabul qilinadi. Qolgan o'quvchilarga portfel va rezyume tayyorlashda HR yordam beradi."
                },
                {
                  q: "To'lovni qismlab yoki onlayn to'lash mumkinmi?",
                  a: "albatta! Shaxsiy LMS kabinet orqali Click, Payme yoki bank kartalari yordamida qulay va avtomatlashtirilgan tarzda to'lov qilishingiz mumkin."
                },
                {
                  q: "Ota-onalar o'quvchi davomatini qanday nazorat qiladi?",
                  a: "Har bir o'quvchiga ota-ona kabineti va Telegram bot/SMS xabarnoma ulanadi. Darsga kelmagan yoki baholari tushgan o'quvchilar haqida avtomatik ogohlantirish keladi."
                }
              ].map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <span className="text-base">{faq.q}</span>
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-emerald-500/20 text-emerald-500' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                        ▼
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── CONTACT ──────────────── */}
      <section id="contact" className="py-14 px-6 lg:px-16 border-t border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-8">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Send className="h-3.5 w-3.5" />{t.contactHeader}</Badge></motion.div>
              <SectionHead title={t.contactHeader} sub={t.contactSub} />
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="rounded-2xl p-8 glass-card">
              <AnimatePresence mode="wait">
                {formSubmitted ? (
                  <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="py-12 text-center space-y-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="h-16 w-16 rounded-full flex items-center justify-center mx-auto"
                      style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </motion.div>
                    <h4 className="font-bold text-lg text-emerald-400">{t.thankYouTitle}</h4>
                    <p className="text-sm text-slate-400">{t.thankYouBody}</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleRegisterLead} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formName}</label>
                        <input type="text" required placeholder="Elyor Karimov" value={leadName} onChange={(e) => setLeadName(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formPhone}</label>
                        <input type="tel" required placeholder="+998 90 123 45 67" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formEmail}</label>
                        <input type="email" placeholder="email@example.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formService}</label>
                        <select value={leadService} onChange={(e) => setLeadService(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          style={{}}>
                          {courses.map(course => (
                            <option key={course.id} value={course.title} style={{ background: '#0d1117' }}>{course.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 text-white text-sm font-bold py-3 px-8 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #059669)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
                        {t.submitButton} <Send className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact info */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl p-8 space-y-6 glass-card">
              <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>Bog'lanish</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <MapPin className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Manzil</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Surxondaryo vil., Termiz shahri, Yubileyny, Lola kafe ro'parasi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <Phone className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Telefon</p>
                    <p className="text-xs text-emerald-400">+998 99 067 00 66</p>
                    <p className="text-xs text-emerald-400">+998 99 037 00 66</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <Mail className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Telegram / Instagram</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>@Brain_IT_academy</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>@brain_administrator</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden mt-2" style={{ border: '1px solid rgba(37,99,235,0.25)', height: '180px' }}>
                <iframe
                  src="https://maps.google.com/maps?q=37.2391389,67.2798056&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Brain IT manzil"
                />
              </div>
              <div className="rounded-xl p-4 mt-2"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(37,99,235,0.25)' }}>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#06B6D4' }}>Kelajak faqat IT bilan!</p>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { Icon: Link, href: '#', color: '#2563EB' },
                  { Icon: Camera, href: '#', color: '#EC4899' },
                  { Icon: Rss, href: '#', color: '#94A3B8' },
                  { Icon: AtSign, href: '#', color: '#06B6D4' },
                ].map(({ Icon, href, color }, i) => (
                  <a key={i} href={href}
                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </a>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ──────────────── TEAM MODAL ──────────────── */}
      <AnimatePresence>
        {teamModalId && (() => {
          const m = team.find(tm => tm.id === teamModalId);
          if (!m) return null;
          return (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTeamModalId(null)} />
              <motion.div className="relative max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl z-10"
                style={{ background: '#0d1117', border: `1.5px solid ${m.accent}44` }}
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg,${m.accent},${m.accent}33)` }} />
                <button onClick={() => setTeamModalId(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10">
                  <X className="h-4 w-4" />
                </button>
                <div className="relative overflow-hidden" style={{ height: '260px', background: (m.photoStyle as any).photoBg || 'transparent' }}>
                  <img src={m.avatar} alt={m.name} className="w-full h-full"
                    style={{
                      objectFit: (m.photoStyle as any).objectFit || 'cover',
                      objectPosition: m.photoStyle.objectPosition,
                      transform: m.photoStyle.transform,
                      transformOrigin: m.photoStyle.transformOrigin,
                      filter: m.photoStyle.filter,
                    }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0d1117 0%,transparent 55%)' }} />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-white text-xl">{m.name}</h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: m.accent }}>{m.role}</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{m.bio}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-slate-400 ml-2 font-semibold">{m.exp}+ yil tajriba</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.skills.map((skill: string) => (
                      <span key={skill} className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ background: `${m.accent}18`, color: m.accent, border: `1px solid ${m.accent}38` }}>
                      {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ──────────────── COURSE MODAL ──────────────── */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCourse(null)} />
            <motion.div className="relative max-w-xl w-full rounded-3xl p-6 space-y-5 shadow-2xl z-10"
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.10)' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <button onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.15)' }}>
                  <Award className="h-5 w-5 text-emerald-400" />
                </div>
                <h4 className="font-heading font-black text-lg text-white">{selectedCourse.title}</h4>
              </div>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>{selectedCourse.category}</span>
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>{selectedCourse.level}</span>
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Clock className="inline h-3 w-3 mr-1" />{selectedCourse.duration}
                </span>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t.modalCurriculumLabel}</p>
                <ul className="space-y-1">
                  {selectedCourse.modules.map(mod => (
                    <li key={mod.id} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {mod.title} ({mod.lessons.length} ta dars)
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span style={{ color: '#06B6D4' }}>{t.durationLabel}: {selectedCourse.duration}</span>
                <span className="text-amber-400">{t.priceLabel}: {selectedCourse.price}</span>
              </div>
              <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <motion.a href="#contact" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCourse(null)}
                  className="inline-flex items-center gap-2 text-white text-xs font-bold py-2.5 px-6 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #059669)' }}>
                  {t.btnRegisterNow} <ArrowRight className="h-3.5 w-3.5" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── SCROLL TO TOP ──────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Yuqoriga"
            className="fixed bottom-24 right-8 z-[60] p-3.5 rounded-2xl text-white"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #059669)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.5)',
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ──────────────── MODULAR FOOTER ──────────────── */}
      <Footer onEnterPortal={onEnterPortal} t={t} />

      {/* ──────────────── CHATBOT WIDGET ──────────────── */}
      <ChatWidget />
    </div>
  );
};
