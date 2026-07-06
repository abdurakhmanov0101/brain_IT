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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
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
const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#2563EB' }) => (
  <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-bold"
    style={{ borderColor: `${color}44`, background: `${color}14`, color }}>
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
      className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl leading-tight dark:text-white text-slate-900">
      {title}
    </motion.h2>
    {sub && <motion.p variants={fadeUp} className="max-w-2xl leading-relaxed text-sm sm:text-base mx-auto dark:text-slate-400 text-slate-600">{sub}</motion.p>}
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPortal, onAddLead, darkMode, setDarkMode, language, setLanguage,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [teamModalId, setTeamModalId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadService, setLeadService] = useState('IT Foundation');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      heroText: "Kompyuter, telefon va biznesni avtomatlashtirishga tegishli dasturlar yaratamiz. Farzandingizni ham dasturchi bo'lishiga professional yondashamiz.",
      btnCourses: "Kurslarni ko'rish", btnContact: "Konsultatsiya olish", btnPortal: "LMS Portaliga kirish",
      statsGraduates: "Bitiruvchilar", statsPlacement: "Ishga joylashish", statsPartners: "Hamkorlar", statsCourses: "Kurslar",
      trustedBy: "Ishonch bildirgan kompaniyalar",
      coursesTitle: "IT yo'nalishlar", coursesDesc: "O'quv yo'nalishlarimiz 0 dan boshlovchilar uchun amaliy mashg'ulotlar, sertifikatlar va ishga yo'naltirishni o'z ichiga oladi.",
      servicesTitle: "Enterprise yechimlar", servicesDesc: "Brain IT shunchaki akademiya emas — bu biznes jarayonlarini avtomatlashtiradigan professional jamoa.",
      servicesBadge: "IT Kompaniya",
      aiTitle: "AI Kuchli Platforma", aiDesc: "Sun'iy intellekt texnologiyalar bilan ta'lim va biznesingizni yangi darajaga olib chiqing.",
      aiBadge: "AI Platform",
      numberTitle: "Raqamlarda Brain IT", numberDesc: "Natijalar o'zi gapiradi.",
      portfolioTitle: "Real Loyihalar", portfolioDesc: "Hayotga tadbiq etilgan ishlanmalarimiz va case study lar.",
      internTitle: "Stajirovka Dasturi", internDesc: "Eng yaxshi o'quvchilarimiz Brain IT kompaniyasida real loyihalarda ishlash imkoniyatiga ega bo'ladi.",
      internBadge: "Internship",
      teamHeader: "Bizning Jamoa", teamSub: "Har bir a'zo o'z sohasida tajribali va real enterprise loyihalarni yetaklashga tayyor.",
      testimonialTitle: "Muvaffaqiyat hikoyalari", testimonialDesc: "O'quvchilarimizning hayotini o'zgartirib yuborgan tajribalar.",
      contactHeader: "Kursga yoki konsultatsiyaga yoziling",
      contactSub: "Arizangizni qoldiring — tez orada administratorlar siz bilan bog'lanishadi.",
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
    { icon: Cpu, title: 'Suniy intellekt', color: '#7C3AED' },
    { icon: BookOpen, title: 'IT Foundation', color: '#06B6D4' },
    { icon: Code, title: 'Frontend dasturlash', color: '#2563EB' },
    { icon: Server, title: 'Backend dasturlash', color: '#7C3AED' },
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
      exp: 3, accent: '#6366f1',
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
    { icon: Smartphone, title: 'Mobil Ilovalar', desc: 'iOS va Android uchun Flutter asosida premium ilovalar.', color: '#7C3AED' },
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
      className={`relative min-h-screen flex flex-col font-sans select-none scroll-smooth overflow-x-hidden transition-colors duration-500 ${darkMode ? 'text-white bg-[#09090b]' : 'text-zinc-900 bg-[#f4f4f5]'}`}
    >
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#09090b]">
        {/* Fallback poster image or color if video loads slowly */}
        <div className="absolute inset-0 bg-[#09090b]" />
        <iframe
          src="https://www.youtube.com/embed/FVeDsAdpqTQ?autoplay=1&mute=1&loop=1&playlist=FVeDsAdpqTQ&controls=0&showinfo=0&rel=0&iv_load_policy=3"
          title="Background Video"
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] sm:w-[150vw] sm:h-[150vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {/* Premium dark vignette overlay for perfect text contrast */}
        <div className="hero-video-overlay" />
      </div>

      {/* ──────────────── MODULAR NAV ──────────────── */}
      <Navbar
        onEnterPortal={onEnterPortal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      {/* ──────────────── MODULAR HERO ──────────────── */}
      <Hero
        onEnterPortal={onEnterPortal}
        onScrollToContact={() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        t={t}
      />


      {/* ──────────────── COURSES / DIRECTIONS ──────────────── */}
      <section id="courses" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto w-full relative z-10">
        <Reveal className="space-y-16">
          <div className="text-center space-y-4">
            <motion.div variants={fadeIn}><Badge color="#2563EB"><BookOpen className="h-3.5 w-3.5" />IT Academy</Badge></motion.div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white drop-shadow-md">{t.coursesTitle}</h2>
            <p className="text-white/80 max-w-2xl mx-auto font-medium drop-shadow-sm">{t.coursesDesc}</p>
          </div>
          <motion.div variants={staggerFast} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {directions.map((dir, i) => {
              const Icon = dir.icon;
              return (
                <motion.button key={i} variants={fadeUp}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openCourseByKey(dir.title)}
                  className="group flex flex-col items-center justify-center gap-4 p-6 text-center glass-card"
                >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 glass-icon-wrapper">
                    <Icon className="h-6 w-6 text-white group-hover:text-violet-400 transition-colors" />
                  </div>
                  <p className="text-[14px] font-semibold leading-snug text-white transition-colors group-hover:text-violet-300">{dir.title}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </Reveal>
      </section>

      {/* ──────────────── SERVICES ──────────────── */}
      <section id="services" className="py-24 px-6 lg:px-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="space-y-16">
            <div className="space-y-4">
              <motion.div variants={fadeIn}><Badge color="#7C3AED"><Rocket className="h-3.5 w-3.5" />{t.servicesBadge}</Badge></motion.div>
              <SectionHead title={t.servicesTitle} sub={t.servicesDesc} center={false} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((srv, i) => {
                const Icon = srv.icon;
                return (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`group rounded-2xl p-8 cursor-pointer transition-all duration-300 backdrop-blur-md border ${darkMode ? 'bg-[#0a0f1e]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                    style={{}}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${srv.color}88`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${srv.color}33`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: `${srv.color}18` }}>
                      <Icon className="h-6 w-6" style={{ color: srv.color }} />
                    </div>
                    <h4 className={`font-bold text-lg mb-2 transition-colors ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-slate-800 group-hover:text-indigo-600'}`}>{srv.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{srv.desc}</p>
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
      <section className="py-24 px-6 lg:px-16 relative overflow-hidden">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <motion.div variants={fadeIn}><Badge color="#7C3AED"><Brain className="h-3.5 w-3.5" />{t.aiBadge}</Badge></motion.div>
              <SectionHead title={t.aiTitle} sub={t.aiDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }}
                    className={`rounded-2xl p-6 text-center transition-all duration-300 backdrop-blur-md hover:-translate-y-2 border ${darkMode ? 'bg-[#0a0f1e]/80 border-violet-500/40 hover:shadow-[0_8px_32px_rgba(124,58,237,0.3)]' : 'bg-white border-violet-200 hover:shadow-lg shadow-sm'}`}
                    style={{}}>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(124,58,237,0.18)' }}>
                      <Icon className="h-6 w-6" style={{ color: '#a855f7' }} />
                    </div>
                    <h4 className={`font-extrabold text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{feat.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── NUMBERS ──────────────── */}
      <section className="py-20 px-6 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14 space-y-4">
              <motion.div variants={fadeIn}><Badge color="#06B6D4"><Star className="h-3.5 w-3.5" />{t.numberTitle}</Badge></motion.div>
              <motion.p variants={fadeUp} className="text-slate-400 text-sm">{t.numberDesc}</motion.p>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: "Talabalar", to: 1200, suffix: '+', color: '#2563EB' },
                { label: "Kurslar", to: 10, suffix: '+', color: '#7C3AED' },
                { label: "O'qituvchilar", to: 8, suffix: '', color: '#06B6D4' },
                { label: "Loyihalar", to: projects.length, suffix: '+', color: '#F59E0B' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="rounded-2xl py-8 px-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-4xl font-black mb-2" style={{ color: s.color }}>
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── PORTFOLIO ──────────────── */}
      <section id="projects" className="py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <motion.div variants={fadeIn}><Badge color="#06B6D4"><Layers className="h-3.5 w-3.5" />Portfolio</Badge></motion.div>
              <SectionHead title={t.portfolioTitle} sub={t.portfolioDesc} />
            </div>
            <motion.div variants={stagger} className="flex flex-wrap justify-center gap-5">
              {projects.slice(0, 6).map((project: Project) => (
                <motion.div key={project.id} variants={fadeUp} whileHover={{ y: -5 }}
                  className={`group rounded-2xl p-6 transition-all duration-300 cursor-default w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] backdrop-blur-md hover:-translate-y-2 border ${darkMode ? 'bg-[#0a0f1e]/80 border-white/10 hover:shadow-[0_8px_32px_rgba(37,99,235,0.2)]' : 'bg-white border-slate-200 hover:shadow-lg shadow-sm'}`}
                  style={{}}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-bold"
                      style={{ color: project.status === 'completed' ? '#10B981' : project.status === 'in_progress' ? '#2563EB' : '#F59E0B' }}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500">{project.progress}%</span>
                  </div>
                  <h4 className={`font-extrabold text-lg mb-1 transition-colors ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>{project.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{project.client}</p>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{project.tasks.length} ta vazifa</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa' }}>
                      {project.progress}% tayyor
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── INTERNSHIP ──────────────── */}
      <section className="py-24 px-6 lg:px-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-16">
              <motion.div variants={fadeIn}><Badge color="#10B981"><Rocket className="h-3.5 w-3.5" />{t.internBadge}</Badge></motion.div>
              <SectionHead title={t.internTitle} sub={t.internDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {internSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} variants={fadeUp}
                    className={`relative rounded-2xl p-8 text-center backdrop-blur-md hover:-translate-y-2 transition-all border ${darkMode ? 'bg-[#0a0f1e]/80 border-emerald-500/30 hover:shadow-[0_8px_32px_rgba(16,185,129,0.2)]' : 'bg-white border-emerald-200 hover:shadow-lg shadow-sm'}`}
                    style={{}}>
                    {i < internSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2 text-slate-700">
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
      <section id="team" className="py-24 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-16 mb-12">
          <Reveal>
            <div className="text-center space-y-4">
              <motion.div variants={fadeIn}><Badge color="#F59E0B"><Users className="h-3.5 w-3.5" />{t.teamHeader}</Badge></motion.div>
              <SectionHead title={t.teamHeader} sub={t.teamSub} />
            </div>
          </Reveal>
        </div>

        {/* Full-width filmstrip */}
        <div className="relative overflow-hidden">
          <div className="filmstrip-track">
            {[...team, ...team].map((member, i) => (
              <div key={i} className="shrink-0 w-80 mx-3 group/card" style={{ height: '560px' }}>
                <div className={`rounded-2xl overflow-hidden h-full flex flex-col ${darkMode ? '' : 'bg-white'}`} style={{
                  background: darkMode ? 'linear-gradient(160deg,#0d1117 0%,#111827 65%,#0a0e1a 100%)' : 'none',
                  border: `1.5px solid ${member.accent}44`,
                  boxShadow: darkMode ? `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)` : `0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)`,
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
      <section className="py-24 px-6 lg:px-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <motion.div variants={fadeIn}><Badge color="#F59E0B"><Star className="h-3.5 w-3.5" />{t.testimonialTitle}</Badge></motion.div>
              <SectionHead title={t.testimonialTitle} sub={t.testimonialDesc} />
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t2, i) => (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -5 }}
                  className={`rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                  style={{}}>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t2.stars }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className={`text-sm leading-relaxed flex-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{t2.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <img src={t2.avatar} alt={t2.name} className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-white">{t2.name}</p>
                      <p className="text-[11px] text-blue-400">{t2.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── CONTACT ──────────────── */}
      <section id="contact" className="py-24 px-6 lg:px-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center space-y-4 mb-14">
              <motion.div variants={fadeIn}><Badge color="#2563EB"><Send className="h-3.5 w-3.5" />{t.contactHeader}</Badge></motion.div>
              <SectionHead title={t.contactHeader} sub={t.contactSub} />
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className={`rounded-2xl p-8 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
              style={{}}>
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
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formPhone}</label>
                        <input type="tel" required placeholder="+998 90 123 45 67" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formEmail}</label>
                        <input type="email" placeholder="email@example.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                          style={{}} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{t.formService}</label>
                        <select value={leadService} onChange={(e) => setLeadService(e.target.value)}
                          className={`w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
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
                        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
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
              className={`rounded-2xl p-8 space-y-6 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
              style={{}}>
              <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>Bog'lanish</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <MapPin className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Manzil</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Surxondaryo vil., Termiz shahri, Yubileyny, Lola kafe ro'parasi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <Phone className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Telefon</p>
                    <p className="text-xs text-blue-400">+998 99 067 00 66</p>
                    <p className="text-xs text-blue-400">+998 99 037 00 66</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.15)' }}>
                    <Mail className="h-4 w-4 text-blue-400" />
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
                  <Award className="h-5 w-5 text-blue-400" />
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
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
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
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
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
            className="fixed bottom-8 right-8 z-[60] p-3.5 rounded-2xl text-white"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.5)',
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ──────────────── MODULAR FOOTER ──────────────── */}
      <Footer onEnterPortal={onEnterPortal} t={t} />
    </div>
  );
};
