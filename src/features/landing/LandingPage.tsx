import { GraduationCap, ArrowRight, CheckCircle, Code, Server, Award, Sparkles, Send, Sun, Moon, Cpu, Monitor, ShieldCheck, BookOpen, Globe2, Calculator, Smile, Menu, X } from 'lucide-react';
import maqsadMonitor from '../../assets/maqsad-monitor.svg';
import React, { useState } from 'react';
import TechBackground from '../../components/TechBackground';
import { courses, projects, type Course, type Project } from '../../data/mockData';

interface LandingPageProps {
  onEnterPortal: () => void;
  onAddLead: (leadData: { name: string; phone: string; email: string; source: string; value: string }) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  language: 'uz' | 'ru' | 'en';
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
  bgAnimationEnabled?: boolean;
  setBgAnimationEnabled?: (v: boolean) => void;
}

type TranslationStrings = {
  navCourses: string;
  navServices: string;
  navContact: string;
  navPortal: string;
  heroBadge: string;
  heroTitle: string;
  heroText: string;
  btnCourses: string;
  btnContact: string;
  statsGraduates: string;
  statsPlacement: string;
  statsPartners: string;
  coursesTitle: string;
  coursesDesc: string;
  servicesTitle: string;
  servicesDesc: string;
  servicesBadge: string;
  teamTitle: string;
  teamDesc: string;
  projectsTitle: string;
  projectsDesc: string;
  contactTitle: string;
  contactDesc: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formService: string;
  submitButton: string;
  modalCurriculum: string;
  btnRegisterNow: string;
  priceLabel: string;
  durationLabel: string;
  detailButton: string;
  modalCurriculumLabel: string;
  footerText: string;
  footerContact: string;
  realProjectsCount: string;
  activeProjects: string;
  clientsCount: string;
  feature1: string;
  feature2: string;
  feature3: string;
  service1Title: string;
  service1Desc: string;
  service2Title: string;
  service2Desc: string;
  service3Title: string;
  service3Desc: string;
  teamHeader: string;
  teamSub: string;
  projectStatsHeader: string;
  projectStatsSub: string;
  contactHeader: string;
  contactSub: string;
  thankYouTitle: string;
  thankYouBody: string;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal, onAddLead, darkMode, setDarkMode, language, setLanguage }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Registration Form
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadService, setLeadService] = useState('IT Foundation');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleRegisterLead = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!leadName.trim()) return;

    // Calculate value based on selected course or service
    let value = '3,500,000 UZS';
    if (leadService.includes('Frontend')) value = '4,000,000 UZS';
    if (leadService.includes('Backend')) value = '4,500,000 UZS';
    if (leadService.includes('Suniy') || leadService.includes('Intellekt')) value = '5,200,000 UZS';
    if (leadService.includes('Kiber')) value = '5,800,000 UZS';

    onAddLead({
      name: leadName,
      phone: leadPhone || '+998901234567',
      email: leadEmail || 'mijoz@example.com',
      source: 'Vebsayt Landing',
      value: value
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
    }, 3000);
  };

  const team = [
    { id: 't1', name: 'Feruza Salimova', role: 'Super Admin & Product Owner', bio: "Loyiha boshqaruvi va mahsulot strategiyasida 6 yillik tajriba. Brain IT ning asoschilaridan biri.", exp: 6, accent: '#6366f1', skills: ['Product Management', 'Agile', 'Scrum'], avatar: 'https://images.unsplash.com/photo-1494790108375-be9c29b29330?w=400&h=400&fit=crop' },
    { id: 't2', name: 'Bobur Akbarov', role: 'Lead Frontend Developer', bio: "React va Next.js bilan zamonaviy UI/UX yechimlar yaratadi. 50+ enterprise loyiha tajribasi.", exp: 5, accent: '#06b6d4', skills: ['React', 'TypeScript', 'Tailwind'], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
    { id: 't3', name: 'Jasur Shodiev', role: 'Project Manager', bio: "Enterprise loyihalarni muvaffaqiyatli boshqarish va yetkazib berish. PMP sertifikatli.", exp: 4, accent: '#22c55e', skills: ['PM', 'Risk Management', 'Jira'], avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
    { id: 't4', name: 'Malika Ismoilova', role: 'Backend Architect', bio: "Django va PostgreSQL asosida kuchli multi-tenant backend tizimlarini quradi.", exp: 7, accent: '#f59e0b', skills: ['Python', 'Django', 'PostgreSQL'], avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
    { id: 't5', name: 'Sardor Toshmatov', role: 'Senior Backend Developer', bio: "Microservices va Docker asosida production infratuzilmalari. DevOps mutaxassisi.", exp: 5, accent: '#ec4899', skills: ['Node.js', 'Docker', 'RabbitMQ'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
    { id: 't6', name: 'Dilnoza Yusupova', role: 'UI/UX Designer', bio: "Foydalanuvchi tajribasini yaxshilashga yo'naltirilgan zamonaviy dizayn. Figma Expert.", exp: 3, accent: '#8b5cf6', skills: ['Figma', 'Prototyping', 'Design Systems'], avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop' },
  ];


  const translations: Record<'uz' | 'ru' | 'en', TranslationStrings> = {
    uz: {
      navCourses: "O'quv Kurslari",
      navServices: "Dasturiy Yechimlar",
      navContact: "Bog'lanish",
      navPortal: "LMS Portaliga Kirish",
      heroBadge: "Brain IT Academy",
      heroTitle: "0 dan dasturchi bo'lib chiqing!",
      heroText: "Kompyuter, telefon va biznesni avtomatlashtirishga tegishli dasturlar yaratamiz. Hamda farzandingizni ham dasturchi bo'lishiga professional yondashamiz.",
      btnCourses: "Kurslarni ko'rish",
      btnContact: "Konsultatsiya olish",
      statsGraduates: "Bitiruvchilar",
      statsPlacement: "Ishga joylashish",
      statsPartners: "Hamkor kompaniyalar",
      coursesTitle: "Bizning yo'nalishlar",
      coursesDesc: "O'quv yo'nalishlarimiz 0 dan boshlovchilar uchun amaliy mashg'ulotlar, sertifikatlar va ishga yo'naltirishni o'z ichiga oladi.",
      servicesTitle: "MAQSADIMIZ",
      servicesDesc: "Kompyuter, Telefon va biznesni avtomatlashtirishga tegishli dasturlarni yaratamiz. Hamda farzandingizni ham dasturchi bo'lishiga professional yondashamiz.",
      servicesBadge: "Kelajak faqat IT bilan!",
      teamTitle: "Bizning jamoa",
      teamDesc: "Har bir a'zo o'z sohasida tajribali va real enterprise loyihalarni yetaklashga tayyor.",
      projectsTitle: "Real loyihalar va statistika",
      projectsDesc: "O'tkazilgan loyiha tajribamiz va hayotga tadbiq etilgan ishlanmalarimiz haqida ma'lumot.",
      contactTitle: "Kursga yoki konsultatsiyaga yoziling",
      contactDesc: "Bizga arizangizni qoldiring, tez orada administratorlarimiz siz bilan bog'lanib, o'quv yoki enterprise rejalarini tuzib berishadi.",
      formName: "Ismingiz",
      formPhone: "Telefon Raqamingiz",
      formEmail: "Elektron pochta (Ixtiyoriy)",
      formService: "Tanlanayotgan xizmat / kurs",
      submitButton: "Yuborish",
      modalCurriculum: "Kurs Dasturi (Syllabus):",
      btnRegisterNow: "Hozir ro'yxatdan o'tish",
      footerText: "© 2026 Brain IT Academy. Barcha huquqlar himoyalangan.",
      footerContact: "Toshkent, Yubileyin korzinka yaqinidagi Lola kafesi ro'parasi | +998 99 067 00 66 | +998 99 037 00 66",
      realProjectsCount: "Real loyihalar",
      activeProjects: "Faol loyihalar",
      clientsCount: "Mijozlar",
      priceLabel: "Narxi",
      durationLabel: "Davomiyligi",
      detailButton: "Batafsil",
      feature1: "Multi-tenant arxitektura (Shared Database PostgreSQL)",
      feature2: "Hikvision Face ID Webhook davomat tizimlari",
      feature3: "Celery, RabbitMQ va Docker-compose production infratuzilmasi",
      service1Title: "Veb Dasturlash",
      service1Desc: "Zamonaviy backend (Django, Node.js) va frontend (React, Next.js) platformalari.",
      service2Title: "Mobil Ilovalar",
      service2Desc: "iOS va Android tizimlari uchun yuqori darajada himoyalangan native ilovalar.",
      service3Title: "Enterprise Infratuzilma",
      service3Desc: "Logical Multi-tenancy tizimlar, Docker va server integratsiyalari.",
      modalCurriculumLabel: "Kurs Dasturi (Syllabus):",
      teamHeader: "Bizning jamoa",
      teamSub: "Har bir a'zo o'z sohasida tajribali va real enterprise loyihalarni yetaklashga tayyor.",
      projectStatsHeader: "Real loyihalar va statistika",
      projectStatsSub: "O'tkazilgan loyiha tajribamiz va hayotga tadbiq etilgan ishlanmalarimiz haqida ma'lumot.",
      contactHeader: "Kursga yoki konsultatsiyaga yoziling",
      contactSub: "Bizga arizangizni qoldiring, tez orada administratorlarimiz siz bilan bog'lanib, o'quv yoki enterprise rejalarini tuzib berishadi.",
      thankYouTitle: "Rahmat! Arizangiz qabul qilindi.",
      thankYouBody: "Tez orada menejerlarimiz siz bilan bog'lanishadi. CRM paneliga o'tib arizani tekshirishingiz mumkin."
    },
    ru: {
      navCourses: 'Курсы',
      navServices: 'Решения',
      navContact: 'Контакты',
      navPortal: 'Войти в LMS',
      heroBadge: 'Учебный центр & Enterprise',
      heroTitle: 'Изучайте современные IT-профессии системно',
      heroText: 'Создаём программы для автоматизации компьютера, телефона и бизнеса. Также помогаем детям стать программистами.',
      btnCourses: 'Посмотреть курсы',
      btnContact: 'Получить консультацию',
      statsGraduates: 'Выпускников',
      statsPlacement: 'Трудоустройство',
      statsPartners: 'Партнёры',
      coursesTitle: 'Наши IT-направления',
      coursesDesc: 'Курсы с практическими заданиями, AI-проверкой и реальными проектами.',
      servicesTitle: 'НАША ЦЕЛЬ',
      servicesDesc: 'Создаём программы для автоматизации компьютера, телефона и бизнеса. Профессионально помогаем детям стать программистами.',
      servicesBadge: 'Будущее только с IT!',
      teamTitle: 'Наша команда',
      teamDesc: 'Каждый участник команды готов вести реальные enterprise-проекты.',
      projectsTitle: 'Реальные проекты и статистика',
      projectsDesc: 'Информация о выполненных проектах и реализованных решениях.',
      contactTitle: 'Запишитесь на курс или консультацию',
      contactDesc: 'Оставьте заявку, и наши менеджеры свяжутся с вами для формирования обучения или корпоративного решения.',
      formName: 'Ваше имя',
      formPhone: 'Телефон',
      formEmail: 'Электронная почта (необязательно)',
      formService: 'Выбираемая услуга / курс',
      submitButton: 'Отправить',
      modalCurriculum: 'Программа курса:',
      btnRegisterNow: 'Записаться сейчас',
      priceLabel: 'Цена',
      durationLabel: 'Длительность',
      detailButton: 'Подробнее',
      modalCurriculumLabel: 'Программа курса:',
      footerText: '© 2026 Brain IT Academy. Все права защищены.',
      footerContact: 'Ташкент, Юбилейный, напротив кафе Лола | +998 99 067 00 66 | +998 99 037 00 66',
      realProjectsCount: 'Реальные проекты',
      activeProjects: 'Активные проекты',
      clientsCount: 'Клиенты',
      feature1: 'Мультиарендная архитектура (Shared Database PostgreSQL)',
      feature2: 'Hikvision Face ID Webhook системы посещаемости',
      feature3: 'Celery, RabbitMQ и Docker-compose production инфраструктура',
      service1Title: 'Веб-разработка',
      service1Desc: 'Современный backend (Django, Node.js) и frontend (React, Next.js).',
      service2Title: 'Мобильные приложения',
      service2Desc: 'Надёжные iOS и Android приложения с высокой безопасностью.',
      service3Title: 'Enterprise инфраструктура',
      service3Desc: 'Мультиарендные системы, Docker и серверные интеграции.',
      teamHeader: 'Наша команда',
      teamSub: 'Каждый участник команды готов вести реальные enterprise-проекты.',
      projectStatsHeader: 'Реальные проекты и статистика',
      projectStatsSub: 'Информация о выполненных проектах и реализованных решениях.',
      contactHeader: 'Запишитесь на курс или консультацию',
      contactSub: 'Оставьте заявку, и наши менеджеры свяжутся с вами.',
      thankYouTitle: 'Спасибо! Ваша заявка принята.',
      thankYouBody: 'Наши менеджеры скоро свяжутся с вами. Вы можете проверить заявку в CRM.'
    },
    en: {
      navCourses: 'Courses',
      navServices: 'Solutions',
      navContact: 'Contact',
      navPortal: 'Enter LMS Portal',
      heroBadge: 'Academy & Enterprise',
      heroTitle: 'Learn modern IT careers with structure',
      heroText: 'Master practical Python, Django and React courses and build enterprise solutions for companies.',
      btnCourses: 'View Courses',
      btnContact: 'Get Consultation',
      statsGraduates: 'Graduates',
      statsPlacement: 'Placement',
      statsPartners: 'Partners',
      coursesTitle: 'Professional IT Courses',
      coursesDesc: 'Courses with practical assignments, AI checks, and real-life projects.',
      servicesTitle: 'Enterprise software solutions',
      servicesDesc: 'Brain IT is more than an academy — it is a professional team automating business processes.',
      servicesBadge: 'Enterprise Software Development',
      teamTitle: 'Our Team',
      teamDesc: 'Every member is ready to lead real enterprise projects.',
      projectsTitle: 'Real Projects & Stats',
      projectsDesc: 'Information about completed projects and delivered enterprise solutions.',
      contactTitle: 'Register for a course or consultation',
      contactDesc: 'Leave your request and our team will contact you to organize training or an enterprise plan.',
      formName: 'Your Name',
      formPhone: 'Phone Number',
      formEmail: 'Email (Optional)',
      formService: 'Selected service / course',
      submitButton: 'Submit',
      modalCurriculum: 'Course Curriculum:',
      btnRegisterNow: 'Register Now',
      priceLabel: 'Price',
      durationLabel: 'Duration',
      detailButton: 'Learn More',
      modalCurriculumLabel: 'Course Curriculum:',
      footerText: '© 2026 Brain IT Co. All rights reserved.',
      footerContact: 'Tashkent, Uzbekistan | Contact: +998901234567 | info@mohirdev.uz',
      realProjectsCount: 'Real Projects',
      activeProjects: 'Active Projects',
      clientsCount: 'Clients',
      feature1: 'Multi-tenant architecture (Shared Database PostgreSQL)',
      feature2: 'Hikvision Face ID Webhook attendance systems',
      feature3: 'Celery, RabbitMQ, and Docker-compose production infrastructure',
      service1Title: 'Web Development',
      service1Desc: 'Modern backend (Django, Node.js) and frontend (React, Next.js) platforms.',
      service2Title: 'Mobile Apps',
      service2Desc: 'High-quality native iOS and Android applications.',
      service3Title: 'Enterprise Infrastructure',
      service3Desc: 'Multi-tenant systems, Docker and server integrations.',
      teamHeader: 'Our Team',
      teamSub: 'Every member is ready to lead real enterprise projects.',
      projectStatsHeader: 'Real Projects & Stats',
      projectStatsSub: 'Information about completed projects and delivered enterprise solutions.',
      contactHeader: 'Register for a course or consultation',
      contactSub: 'Leave your request and our team will contact you.',
      thankYouTitle: 'Thank you! Your request has been submitted.',
      thankYouBody: 'Our managers will contact you soon. You can check the request in CRM.'
    }
  };

  const t = translations[language] as TranslationStrings;

  const directions = [
    { icon: Monitor, title: 'Kompyuter savodxonligi' },
    { icon: Cpu, title: 'Suniy intellekt' },
    { icon: BookOpen, title: 'IT Foundation' },
    { icon: Code, title: 'Frontend dasturlash' },
    { icon: Server, title: 'Backend dasturlash' },
    { icon: ShieldCheck, title: 'Kiber xavfsizlik' },
    { icon: Sparkles, title: 'Roboto-texnika' },
    { icon: Smile, title: 'IT Kids' },
    { icon: Globe2, title: 'English for IT' },
    { icon: Calculator, title: 'Math for IT' },
  ];

  const projectStats = [
    { label: t.realProjectsCount, value: `${projects.length}+` },
    { label: t.activeProjects, value: `${projects.filter(p => p.status !== 'completed').length}` },
    { label: t.clientsCount, value: `${new Set(projects.map(p => p.client)).size}` }
  ];

  // Map Maqsad cards to courses (by id) and helpers to open the course modal
  const cardToCourseMap: Record<string, string> = {
    'Kompyuter savodxonligi': 'c1',
    'Suniy intellekt': 'c4',
    'IT Foundation': 'c1',
    'Ishga joylashtirish': 'c2'
  };

  const directionToCourseMap: Record<string, string> = {
    'Kompyuter savodxonligi': 'c1',
    'Suniy intellekt': 'c4',
    'IT Foundation': 'c1',
    'Frontend dasturlash': 'c2',
    'Backend dasturlash': 'c3',
    'Kiber xavfsizlik': 'c5',
    'Roboto-texnika': 'c1',
    'IT Kids': 'c1',
    'English for IT': 'c1',
    'Math for IT': 'c1'
  };

  const openCourseByKey = (key: string) => {
    const id = cardToCourseMap[key] || directionToCourseMap[key];
    const course = courses.find(c => c.id === id) || courses[0] || null;
    if (course) setSelectedCourse(course as Course);
  };

  const getCourseImageForKey = (_key: string) => {
    return maqsadMonitor;
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans select-none scroll-smooth text-white">
      <TechBackground />
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-16 py-4 flex justify-between items-center backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg leading-tight tracking-wide text-white">Brain IT Academy</h1>
            <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">IT Ta'lim markazi</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'uz' | 'ru' | 'en')}
            className="bg-white/10 border border-white/20 text-white rounded-2xl py-2 px-3 text-xs font-semibold focus:outline-none"
          >
            <option value="uz" className="bg-slate-900 text-white">UZ</option>
            <option value="ru" className="bg-slate-900 text-white">RU</option>
            <option value="en" className="bg-slate-900 text-white">EN</option>
          </select>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/10 border border-white/20 rounded-2xl p-2 transition-all hover:bg-white/20"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-500" />}
          </button>

          {/* Nav links — faqat >= 1000px da ko'rinadi */}
          <nav className="hidden nav:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#courses" className="hover:text-white transition-colors">{t.navCourses}</a>
            <a href="#services" className="hover:text-white transition-colors">{t.navServices}</a>
            <a href="#contact" className="hover:text-white transition-colors">{t.navContact}</a>
          </nav>

          {/* Portal tugmasi — >= 1000px da ko'rinadi */}
          <button
            onClick={onEnterPortal}
            className="hidden nav:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            {t.navPortal} <ArrowRight className="h-4 w-4" />
          </button>

          {/* Hamburger — faqat < 1000px da ko'rinadi */}
          <button
            onClick={() => setMenuOpen(true)}
            className="nav:hidden bg-white/10 border border-white/20 rounded-xl p-2 text-white hover:bg-white/20 transition-all"
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay — < 1000px */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] nav:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-slate-950 border-l border-white/10 flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menyu</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { href: '#courses', label: t.navCourses },
                { href: '#services', label: t.navServices },
                { href: '#contact', label: t.navContact },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={() => { setMenuOpen(false); onEnterPortal(); }}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 px-5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                {t.navPortal} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 py-24 lg:py-36 flex flex-col items-center text-center border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300 dark:border-indigo-400/40 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" /> {t.heroBadge}
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-white dark:drop-shadow-lg">
            {t.heroTitle}
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-7">
            {t.heroText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-5">
            <a href="#courses" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 px-7 rounded-2xl transition-colors shadow-lg shadow-indigo-600/30">
              {t.btnCourses}
            </a>
            <a href="#contact" className="border border-slate-300 dark:border-white/25 hover:border-indigo-400 dark:hover:border-white/50 text-slate-700 dark:text-white text-xs font-semibold py-3 px-7 rounded-2xl transition-colors">
              {t.btnContact}
            </a>
          </div>
        </div>
        <div className="relative z-10 mt-16 max-w-4xl w-full grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 dark:backdrop-blur-md p-6 rounded-3xl ">
          <div className="space-y-2">
            <p className="text-2xl font-black text-indigo-400">1,200+</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">{t.statsGraduates}</p>
          </div>
          <div className="space-y-2 border-t border-white/10 py-4 sm:border-t-0 sm:border-x sm:py-0 px-0 sm:px-4">
            <p className="text-2xl font-black text-emerald-400">95%</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">{t.statsPlacement}</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-black text-violet-400">15+</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">{t.statsPartners}</p>
          </div>
        </div>
      </section>

      {/* Bizning yo'nalishlar section */}
      <section id="courses" className="px-6 lg:px-16 py-20 space-y-12 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3">
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">{t.coursesTitle}</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">{t.coursesDesc}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {directions.map((direction, index) => {
            const Icon = direction.icon;
            return (
              <button
                key={index}
                onClick={() => openCourseByKey(direction.title)}
                className="group flex min-h-[120px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-md text-center p-6 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/10 "
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-300 transition-all duration-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/25">
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[13px] font-semibold text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                  {direction.title}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Maqsadlarimiz */}
      <section id="maqsadlar" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="space-y-4 text-center lg:text-left">
            <span className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-400/30 text-indigo-300 text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
              {t.servicesBadge}
            </span>
            <h3 className="font-heading font-black text-3xl leading-tight text-white">{t.servicesTitle}</h3>
            <p className="mx-auto max-w-3xl text-xs sm:text-sm text-slate-400 leading-relaxed lg:mx-0">{t.servicesDesc}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { key: 'Kompyuter savodxonligi', title: 'Kompyuter savodxonligi', desc: 'Asosiy ofis dasturlari, tizim bilan ishlash va kundalik muammolarni hal qilish.', items: ["Boshlang'ich va o'rta daraja darslar", 'Amaliy mashg\'ulotlar va loyihalar', 'Sertifikat bilan yakunlanadi'] },
              { key: 'Suniy intellekt', title: 'Suniy intellekt', desc: "AI asoslari, mashina o'rganish va amaliy loyihalar bilan bilimlarni mustahkamlash.", items: ['Python va ML kutubxonalari', 'Modellarni o\'qitish va baholash', 'Real dunyo loyihalari'] },
              { key: 'IT Foundation', title: 'IT Foundation', desc: 'IT asoslari: algoritmlar, tarmoq, va dasturlashning muhim jihatlari.', items: ['Nazariy va amaliy mashg\'ulotlar', 'Mentorlik va kod ko\'rib chiqish', 'Tayyor ish portfoliolari'] },
              { key: 'Ishga joylashtirish', title: 'Ishga joylashtirish', desc: "Tayyor talabalarni ishga yo'naltirish, Brain IT kompaniyasi bilan hamkorlikda imkoniyatlar.", items: ['Rezyume va intervyu tayyorlash', 'Stajirovka va ishga yo\'naltirish', "O'quvchilarga qo'llab-quvvatlash"] },
            ].map((card) => (
              <div key={card.key} className="group rounded-3xl border border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-md p-6 flex gap-6 items-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/60 hover:shadow-xl ">
                <img src={getCourseImageForKey(card.key)} alt={card.title} className="w-36 h-24 rounded-xl object-cover shrink-0 shadow-md group-hover:scale-105 transition-all duration-300" />
                <div>
                  <h4 className="font-heading font-black text-lg text-white group-hover:text-indigo-300 transition-colors">{card.title}</h4>
                  <p className="text-sm text-slate-400 mt-2">{card.desc}</p>
                  <ul className="mt-3 text-xs text-slate-400 space-y-1">
                    {card.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                  <div className="mt-4">
                    <button onClick={() => openCourseByKey(card.key)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all duration-300">
                      Batafsil <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="px-6 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">{t.projectsTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">{t.projectsDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {projectStats.map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center ">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 3).map((project: Project) => (
              <div key={project.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-3 hover:border-indigo-400/40 transition-colors ">
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-400 font-semibold">{project.status.replace('_', ' ').toUpperCase()}</p>
                <h4 className="font-heading font-bold text-lg text-white">{project.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{project.client}</p>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  <span>{project.tasks.length} ta vazifa</span>
                  <span className="text-indigo-400">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section — Filmstrip / Plyokka */}
      <section id="team" className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 mb-10">
          <div className="text-center space-y-3">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">{t.teamHeader}</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">{t.teamSub}</p>
          </div>
        </div>

        {/* Full-width filmstrip */}
        <div className="relative overflow-hidden">
          {/* Scrolling track — 2 copies for seamless loop */}
          <div className="filmstrip-track">
            {[...team, ...team].map((member, i) => (
              <div key={i} className="shrink-0 w-72 mx-4">
                <div className="rounded-2xl overflow-hidden" style={{
                  background: 'linear-gradient(160deg,#0d1117 0%,#111827 65%,#0a0e1a 100%)',
                  border: `1.5px solid ${member.accent}44`,
                  boxShadow: `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)`,
                }}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg,${member.accent},${member.accent}33)` }} />
                  <div className="relative h-56 overflow-hidden">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#0d1117 0%,transparent 60%)' }} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="font-heading font-black text-white text-base leading-tight">{member.name}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: member.accent }}>{member.role}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{member.bio}</p>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1.5">{member.exp} yil tajriba</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.map((skill: string) => (
                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${member.accent}18`, color: member.accent, border: `1px solid ${member.accent}38` }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] tracking-widest font-bold text-slate-600">BRAIN IT ACADEMY</span>
                      <span className="text-xs font-black" style={{ color: `${member.accent}88` }}>◈</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left blur + fade overlay — cards emerge from darkness on right, but fade into this on left */}
          <div className="absolute inset-y-0 left-0 w-[34%] z-10 pointer-events-none" style={{
            background: 'linear-gradient(to right, rgba(9,10,15,1) 0%, rgba(9,10,15,0.88) 30%, rgba(9,10,15,0.55) 60%, transparent 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maskImage: 'linear-gradient(to right, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 55%, transparent 100%)',
          }} />

          {/* Right blur + fade overlay — cards enter blurry from right */}
          <div className="absolute inset-y-0 right-0 w-[34%] z-10 pointer-events-none" style={{
            background: 'linear-gradient(to left, rgba(9,10,15,1) 0%, rgba(9,10,15,0.88) 30%, rgba(9,10,15,0.55) 60%, transparent 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 55%, transparent 100%)',
          }} />
        </div>
      </section>

      {/* Lead Capture Registration form */}
      <section id="contact" className="px-6 lg:px-16 py-20 max-w-6xl mx-auto w-full">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl ">
            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="font-heading font-bold text-base text-emerald-400">{t.thankYouTitle}</h4>
                <p className="text-xs text-slate-400">{t.thankYouBody}</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterLead} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider font-bold text-slate-400">{t.formName}</label>
                    <input type="text" required placeholder="Elyor Karimov" value={leadName} onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider font-bold text-slate-400">{t.formPhone}</label>
                    <input type="tel" required placeholder="+998901234567" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider font-bold text-slate-400">{t.formEmail}</label>
                    <input type="email" placeholder="email@example.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider font-bold text-slate-400">{t.formService}</label>
                    <select value={leadService} onChange={(e) => setLeadService(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none font-semibold">
                      {courses.map(course => (
                        <option key={course.id} value={course.title} className="bg-white dark:bg-slate-900 text-slate-900">{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
                    {t.submitButton} <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-50 dark:bg-white/5 dark:backdrop-blur-md p-8 text-sm ">
            <div className="space-y-3">
              <h3 className="font-heading text-xl font-black text-white">Bog'lanish</h3>
              <p className="text-xs leading-relaxed text-slate-400">Yubileyin korzinka yaqinidagi Lola kafesi ro'parasi</p>
              <div className="space-y-1 pt-2">
                <p className="font-semibold text-slate-300">Telefon:</p>
                <p className="text-indigo-400">+998 99 067 00 66</p>
                <p className="text-indigo-400">+998 99 037 00 66</p>
              </div>
              <div className="space-y-1 pt-2">
                <p className="font-semibold text-slate-300">Telegram:</p>
                <p className="text-slate-400">@Brain_IT_academy</p>
                <p className="font-semibold text-slate-300">Manager:</p>
                <p className="text-slate-400">@brain_administrator</p>
              </div>
              <div className="space-y-1 pt-2">
                <p className="font-semibold text-slate-300">Instagram:</p>
                <p className="text-slate-400">@Brain_it_academy</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold">Kelajak faqat IT bilan!</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full p-6 rounded-3xl shadow-2xl relative space-y-6">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-bold"
            >
              ✕
            </button>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" />
                <h4 className="font-heading font-black text-lg text-white">{selectedCourse.title}</h4>
              </div>
              
              <p>{selectedCourse.category} · {selectedCourse.level} · {selectedCourse.duration}</p>
              
              <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-200 dark:border-dark-border space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-200">{t.modalCurriculumLabel}</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {selectedCourse.modules.map(mod => (
                    <li key={mod.id} className="font-semibold">{mod.title} ({mod.lessons.length} ta dars)</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center font-bold">
                <span className="text-indigo-400">{t.durationLabel}: {selectedCourse.duration}</span>
                <span className="text-amber-500">{t.priceLabel}: {selectedCourse.price}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <a
                href="#contact"
                onClick={() => {
                  setSelectedCourse(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                {t.btnRegisterNow}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 lg:px-16 text-center text-xs font-semibold space-y-2 bg-slate-100 dark:bg-slate-950/60 dark:backdrop-blur-md text-slate-400">
        <p>{t.footerText}</p>
        <p>{t.footerContact}</p>
      </footer>
    </div>
  );
};

