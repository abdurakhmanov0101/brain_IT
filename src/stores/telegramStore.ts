/**
 * Telegram Bot Store
 * Ota-onalarning Telegram chat_id larini va bot state ni saqlaydi.
 * Polling orqali yangi javoblarni kuzatib boradi.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  pollBotUpdates,
  parseStartCommand,
  sendTelegramMessage,
} from '../services/telegramBot';

export interface ParentTelegramLink {
  studentId: string;
  chatId: number;
  firstName?: string;
  username?: string;
  linkedAt: string;
}

interface TelegramBotState {
  /** studentId → chatId xaritasi */
  links: ParentTelegramLink[];
  lastUpdateId: number;
  isPolling: boolean;

  /** Ota-onaning chatId ni tizimga saqlash */
  registerParent: (studentId: string, chatId: number, firstName?: string, username?: string) => void;

  /** Berilgan studentga bog'langan chatId ni olish */
  getChatId: (studentId: string) => number | null;

  /** O'quvchi uchun bog'lanish mavjudligini tekshirish */
  isLinked: (studentId: string) => boolean;

  /** /start buyrug'i kelganda chatId ni saqlash va tasdiq xabari yuborish */
  handleStartCommand: (chatId: number, text: string, firstName?: string, username?: string) => void;

  /** Yangi xabarlarni polling orqali olish, javoblarni qaytarish */
  pollAndProcessReplies: () => Promise<Array<{ studentId: string; chatId: number; replyText: string }>>;

  setLastUpdateId: (id: number) => void;
  setPolling: (v: boolean) => void;
}

export const useTelegramStore = create<TelegramBotState>()(
  persist(
    (set, get) => ({
      links: [],
      lastUpdateId: 0,
      isPolling: false,

      registerParent: (studentId, chatId, firstName, username) => {
        set(s => {
          const exists = s.links.find(l => l.studentId === studentId);
          if (exists) {
            return {
              links: s.links.map(l =>
                l.studentId === studentId
                  ? { ...l, chatId, firstName, username, linkedAt: new Date().toISOString() }
                  : l
              ),
            };
          }
          return {
            links: [
              ...s.links,
              { studentId, chatId, firstName, username, linkedAt: new Date().toISOString() },
            ],
          };
        });
      },

      getChatId: (studentId) => {
        return get().links.find(l => l.studentId === studentId)?.chatId ?? null;
      },

      isLinked: (studentId) => {
        return get().links.some(l => l.studentId === studentId);
      },

      handleStartCommand: (chatId, text, firstName, username) => {
        const studentId = parseStartCommand(text);
        if (!studentId) {
          // /start dan keyin studentId kelmasas, umumiy salom yubor
          sendTelegramMessage(chatId,
            `👋 <b>Salom${firstName ? ', ' + firstName : ''}!</b>\n\n` +
            `Bu Brain IT Academy nazorat botidir. Farzandingiz davomati haqida avtomatik xabarnomalar olish uchun akademiya xodimlaridan ulanish havolasini oling.\n\n` +
            `<i>@BIT_nazorat_bot</i>`
          );
          return;
        }
        get().registerParent(studentId, chatId, firstName, username);
        sendTelegramMessage(chatId,
          `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n` +
          `Endi farzandingiz davomati haqida xabarnomalar shu chatga keladi.\n\n` +
          `📌 Agar farzandingiz kelmasa, sizga sabab so'ragan xabar keladida — shunchaki javob yozing, u tizimga saqlanadi.\n\n` +
          `<i>Brain IT Academy — @BIT_nazorat_bot</i>`
        );
      },

      pollAndProcessReplies: async () => {
        const { lastUpdateId, links } = get();
        const { updates, lastUpdateId: newLastId } = await pollBotUpdates(lastUpdateId);
        
        if (newLastId !== lastUpdateId) {
          set({ lastUpdateId: newLastId });
        }

        const replies: Array<{ studentId: string; chatId: number; replyText: string }> = [];

        for (const upd of updates) {
          // /start buyrug'ini process qilish
          if (upd.text.startsWith('/start')) {
            get().handleStartCommand(upd.chatId, upd.text, upd.firstName, upd.username);
            continue;
          }

          // Bu ota-onadan kelgan javobmi?
          const link = links.find(l => l.chatId === upd.chatId);
          if (link && upd.text && !upd.text.startsWith('/')) {
            // Tasdiq xabari yuborish
            sendTelegramMessage(upd.chatId,
              `📩 <b>Javobingiz qabul qilindi!</b>\n\n` +
              `"${upd.text}"\n\n` +
              `Bu ma'lumot tizimda farzandingizning yozuviga qo'shildi.\n` +
              `<i>Brain IT Academy nazorat tizimi</i>`
            );
            replies.push({
              studentId: link.studentId,
              chatId: upd.chatId,
              replyText: upd.text,
            });
          }
        }

        return replies;
      },

      setLastUpdateId: (id) => set({ lastUpdateId: id }),
      setPolling: (v) => set({ isPolling: v }),
    }),
    { name: 'brain-it-telegram-store-v1' }
  )
);
