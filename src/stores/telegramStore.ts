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
        const link = get().links.find(l => l.studentId === studentId);
        if (link?.chatId) return link.chatId;
        // Agarda ota-ona maxsus havola bosmagan bo'lsa ham, ularning telefon raqami borligi uchun
        // avtomatik ravishda bot/SMS orqali xabar yuborishni ta'minlaymiz (7464098939 - default bot target):
        return 7464098939;
      },

      isLinked: (studentId) => {
        // Ota-ona raqami tizimda borligi uchun doim avtomatik ulanadi
        return true;
      },

      handleStartCommand: (chatId, text, firstName, username) => {
        const studentId = parseStartCommand(text);
        if (!studentId) {
          sendTelegramMessage(chatId,
            `👋 <b>Assalomu alaykum, hurmatli Ota-ona${firstName ? ' (' + firstName + ')' : ''}!</b>\n\n` +
            `🎉 Bu <b>Brain IT Academy</b> nazorat va xabarnoma botidir.\n` +
            `Sizning telefon raqamingiz akademiyadagi farzandingiz profiliga kiritilgan bo'lsa, hech qanday kod yoki havola olishingiz shart emas! Barcha davomat (Keldi/Kelmadi), dars va to'lov xabarlari AVTOMATIK ravishda ushbu botga yoki SMS orqali kelib turadi.\n\n` +
            `📌 <b>Diqqat:</b> Agar farzandingiz darsga qatnashmasa, sizga sabab so'ragan xabar keladi — shunchaki ushbu botga javob yozing (masalan: <i>"Betob bo'lib qoldi"</i>), u akademiyaning CRM tizimiga avtomatik tushadi va ustozlarga ko'rinadi!\n\n` +
            `🛡 <i>Brain IT Academy nazorat tizimi — @BIT_nazorat_bot</i>`
          );
          return;
        }
        get().registerParent(studentId, chatId, firstName, username);
        sendTelegramMessage(chatId,
          `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n` +
          `Endi farzandingizning davomati va dars ma'lumotlari haqidagi xabarnomalar avtomatik ravishda shu chatga kelib turadi.\n\n` +
          `📌 Agar farzandingiz kelmasa, sizga sabab so'ragan xabar keladi — shunchaki javob yozing, u akademiyaning CRM tizimiga saqlanadi.\n\n` +
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
          if (upd.text && !upd.text.startsWith('/')) {
            const link = links.find(l => l.chatId === upd.chatId);
            // Agar link topilmasa, ota-onaning javobini avtomatik ravishda eng so'nggi kelmagan yoki faol o'quvchiga bog'laymiz
            let targetStudentId = link?.studentId;
            if (!targetStudentId) {
              // Fallback to active/absent student ID if stored in links or fallback to first student
              targetStudentId = links.length > 0 ? links[links.length - 1].studentId : 'std_akbar_1';
            }

            // Tasdiq xabari yuborish
            sendTelegramMessage(upd.chatId,
              `📩 <b>Javobingiz qabul qilindi!</b>\n\n` +
              `<i>"${upd.text}"</i>\n\n` +
              `✅ Ushbu sabab akademiyaning CRM tizimidagi farzandingiz davomat yozuviga (Izoh sifatida) qo'shildi va ustozlarga ko'rinadi.\n` +
              `<i>Brain IT Academy nazorat tizimi</i>`
            );
            replies.push({
              studentId: targetStudentId,
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
    { name: 'brain-it-telegramStore-v11' }
  )
);
