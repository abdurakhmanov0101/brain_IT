import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, X, Bot, User, Sparkles, 
  PhoneCall, BookOpen, Trophy, ShieldCheck 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Salom! Men Brainy — Brain IT virtual yordamchisiman. Sizga qanday yordam bera olaman? 😊",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick replies mapping
  const QUICK_REPLIES = [
    { label: "🎓 Kurslar va narxlar", action: "courses" },
    { label: "🚀 Stajirovka dasturi", action: "internship" },
    { label: "🤖 AI va Face ID tizimi", action: "features" },
    { label: "📞 Menejer bilan bog'lanish", action: "contact" }
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Trigger bot response after typing delay
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponseText = getBotResponse(text);
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleQuickReply = (action: string, label: string) => {
    // Add user message for selected quick reply
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: label,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponseText = "";
      
      switch (action) {
        case "courses":
          botResponseText = "Brain IT akademiyasida quyidagi professional kurslar mavjud:\n\n" +
            "• 💻 Frontend dasturlash (React, Next.js)\n" +
            "• ⚙️ Backend dasturlash (Python, Django)\n" +
            "• 🧠 Sun'iy intellekt va Data Science\n" +
            "• 🛡️ Kiberxavfsizlik va Linux\n" +
            "• 🤖 Roboto-texnika va IT Kids\n\n" +
            "Kurslarimiz haftada 3 marta, 2 soatdan amaliy mashg'ulotlar tarzida olib boriladi. Narxlar oyiga 600,000 so'mdan boshlanadi. Bizda 100% ishga joylashish kafolati mavjud!";
          break;
        case "internship":
          botResponseText = "🚀 Brain IT Stajirovka (Internship) dasturi:\n\n" +
            "Eng iqtidorli o'quvchilarimiz o'qish jarayonining 6-oyidan boshlab Brain IT dasturiy ta'minot kompaniyasiga amaliyotga qabul qilinadi. U yerda siz:\n" +
            "1. Haqiqiy mijozlarning real loyihalarida ishlaysiz.\n" +
            "2. Senior dasturchilar bilan hamkorlikda kod yozasiz.\n" +
            "3. Oylik maosh olish imkoniyatiga ega bo'lasiz!";
          break;
        case "features":
          botResponseText = "🤖 Brain IT zamonaviy platforma imkoniyatlari:\n\n" +
            "• **Face ID Davomat**: Darslarga kelganingiz avtomatik ravishda yuzni tanish tizimi orqali belgilanadi.\n" +
            "• **Tanga (Coin) tizimi**: Darsdagi faollik, uy vazifalarini a'lo topshirish uchun tangalar yutasiz va ularni Brain IT Marketda real sovg'alarga almashtirasiz!\n" +
            "• **In-Class Live Compiler**: LMS portalimizning o'zida kod yozib, natijani darhol tekshirishingiz mumkin.";
          break;
        case "contact":
          botResponseText = "📞 Menejer bilan aloqa:\n\n" +
            "Menejerimiz sizga kurslar haqida batafsil ma'lumot berishi va birinchi bepul darsga yozishi uchun telefon raqamingizni kiriting (masalan: `+998990670066`). Yoki to'g'ridan-to'g'ri aloqa:\n" +
            "📞 +998 99 067 00 66\n" +
            "📍 Termiz shahri, Yubileyny chorrahasi.";
          break;
        default:
          botResponseText = "Tushunmadim, iltimos boshqa savol bering.";
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const text = input.toLowerCase();

    if (text.includes("salom") || text.includes("assalom") || text.includes("hello") || text.includes("privet")) {
      return "Assalomu alaykum! Savollaringiz bo'lsa bajonidil javob beraman. Brain IT haqida nimalarni bilmoqchisiz? 😊";
    }
    if (text.includes("narx") || text.includes("pul") || text.includes("qancha") || text.includes("to'lov")) {
      return "Kurslarimiz narxlari tanlangan yo'nalishga qarab oyiga 600,000 so'mdan boshlanadi. Agar 3 oylik to'lovni oldindan amalga oshirsangiz, maxsus chegirmalarimiz mavjud! 💳";
    }
    if (text.includes("manzil") || text.includes("joy") || text.includes("qayerda") || text.includes("lokatsiya")) {
      return "📍 Bizning manzilimiz: Surxondaryo viloyati, Termiz shahri, Yubileyny chorrahasi (avvalgi IT Park binosi ro'parasida). Kelib platformamiz va dars xonalari bilan bevosita tanishishingiz mumkin.";
    }
    if (text.includes("telefon") || text.includes("raqam") || text.includes("aloqa") || text.includes("bog'lanish")) {
      return "📞 Biz bilan bog'lanish uchun telefon raqamimiz: +998 99 067 00 66. Menejerlarimiz har kuni soat 9:00 dan 19:00 gacha qo'ng'iroqlarga javob berishadi.";
    }
    if (text.includes("dastur") || text.includes("kurs") || text.includes("o'rgan")) {
      return "Brain IT'da Frontend, Backend, Sun'iy Intellekt, Kiberxavfsizlik, Roboto-texnika va IT Kids yo'nalishlari mavjud. Yo'nalishlarimiz noldan professional darajagacha o'rgatiladi. 🎓";
    }
    if (text.includes("staj") || text.includes("amaliyot") || text.includes("ishga")) {
      return "🚀 Brain IT stajirovkasi orqali eng yaxshi bitiruvchilarimizni o'z jamoamizga ishga olamiz. Hozirgacha 85% dan ortiq talabalarimiz muvaffaqiyatli ishga joylashgan!";
    }
    if (/\+?998\d{9}/.test(text.replace(/\s/g, ''))) {
      return "Rahmat! Telefon raqamingiz qabul qilindi. Menejerimiz tez orada siz bilan bog'lanib, bepul sinov darsiga taklif qiladi! 📞✨";
    }

    return "Kechirasiz, ushbu savolga aniq javob topa olmadim. Sizga yordam berishim uchun quyidagi tugmalardan birini bosishingiz yoki telefon raqamingizni qoldirishingiz mumkin. 👇";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* --- FLOATING CHAT WINDOW --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[360px] sm:w-[380px] h-[520px] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  <Bot className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm tracking-wide">Brainy Assistant</h3>
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Online · Sun'iy intellekt
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Message History Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/30">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar Icon */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-white/5 border-white/10 text-violet-400'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 text-violet-400 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 bg-white/5 text-slate-400 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Grid */}
            <div className="px-4 py-2 bg-slate-950/50 border-t border-white/5 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply.action}
                  onClick={() => handleQuickReply(reply.action, reply.label)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 transition-all active:scale-95"
                >
                  {reply.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputText); }}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={() => handleSend(inputText)}
                className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING CHAT BUBBLE BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-xl hover:shadow-indigo-500/30 transition-all border border-white/15 relative group"
        style={{
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6" />
              {/* Pulsing indicator dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-600 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Tooltip */}
        <div className="absolute right-16 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Savolingiz bormi? Brainy yordam beradi! 🧠✨
        </div>
      </motion.button>

    </div>
  );
};
