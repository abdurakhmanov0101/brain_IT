/**
 * Brain IT Academy — Telegram Bot Service
 * Bot: @BIT_nazorat_bot
 * Token: 8929852665:AAEYEriHsS-1MT4bV53vdwm886qBCAvMxZE
 *
 * Qanday ishlaydi:
 * 1. Ota-ona @BIT_nazorat_bot ga /start {studentId} yozadi
 * 2. Bot ularning chat_id ni tizimga saqlaydi (useTelegramStore orqali)
 * 3. Davomat belgilananda sendAttendanceNotification chaqiriladi
 * 4. Ota-ona javob yozsa, pollUpdates uning javobini o'qib, studentning absentReason ga qo'shadi
 */

const BOT_TOKEN = '8929852665:AAEYEriHsS-1MT4bV53vdwm886qBCAvMxZE';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'first_lesson';

export interface TelegramMessage {
  chatId: number;
  text: string;
}

/** Telegram botga xabar yuboradi */
export async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    console.warn('[TelegramBot] Xabar yuborishda xatolik:', chatId);
    return false;
  }
}

/** 
 * Davomat xabari: keldi / kelmadi / kech keldi 
 */
export async function sendAttendanceNotification(opts: {
  chatId: number;
  studentName: string;
  courseName: string;
  groupName: string;
  date: string;           // '2026-07-15'
  time: string;           // '10:00'
  status: AttendanceStatus;
}): Promise<boolean> {
  const { chatId, studentName, courseName, groupName, date, time, status } = opts;
  
  // Sanani formatlash: 2026-07-15 → 15.07.2026
  const [y, m, d] = date.split('-');
  const dateFormatted = `${d}.${m}.${y}`;

  let text = '';

  if (status === 'present' || status === 'first_lesson') {
    text = 
`✅ <b>Brain IT Academy — Davomat Xabari</b>

Hurmatli ota-ona!
Farzandingiz <b>${studentName}</b> — <b>${courseName}</b> kursining <b>${groupName}</b> guruhiga bugun o'z vaqtida keldi.

🕐 Sana: ${dateFormatted}
⏱ Soat: ${time}

<i>Brain IT Academy nazorat tizimi</i>`;
  } else if (status === 'late') {
    text = 
`⏰ <b>Brain IT Academy — Kechikish Xabari</b>

Hurmatli ota-ona!
Farzandingiz <b>${studentName}</b> — <b>${courseName}</b> kursining <b>${groupName}</b> guruhiga bugun <b>kechikib keldi</b>.

🕐 Sana: ${dateFormatted}
⏱ Belgilangan vaqt: ${time}

Iltimos, o'z vaqtida kelishga harakat qiling.
<i>Brain IT Academy nazorat tizimi</i>`;
  } else if (status === 'absent') {
    text = 
`⚠️ <b>Brain IT Academy — Davomat Xabari</b>

Hurmatli ota-ona!
Farzandingiz <b>${studentName}</b> bugun <b>${courseName}</b> kursining <b>${groupName}</b> guruhiga <b>kelmadi</b>.

🗓 Sana: ${dateFormatted}
⏱ Dars vaqti: ${time}

❓ <b>Iltimos, sabab haqida xabar yuboring.</b>
Sizning javobingiz tizimda saqlanadi va o'quvchi yozuviga qo'shiladi.

<i>Brain IT Academy nazorat tizimi</i>`;
  } else if (status === 'excused') {
    text = 
`📋 <b>Brain IT Academy — Sababli Davomat</b>

Hurmatli ota-ona!
Farzandingiz <b>${studentName}</b> bugungi <b>${courseName}</b> (${groupName}) darsiga <b>sababli kelmadi</b> deb belgilandi.

🗓 Sana: ${dateFormatted}

<i>Brain IT Academy nazorat tizimi</i>`;
  }

  if (!text) return false;
  return sendTelegramMessage(chatId, text);
}

/** Botdan yangi update larni olib, ota-onalar javoblarini qaytaradi */
export async function pollBotUpdates(lastUpdateId: number): Promise<{
  updates: Array<{
    updateId: number;
    chatId: number;
    text: string;
    username?: string;
    firstName?: string;
  }>;
  lastUpdateId: number;
}> {
  try {
    const res = await fetch(
      `${API_BASE}/getUpdates?offset=${lastUpdateId + 1}&limit=50&timeout=0`
    );
    const data = await res.json();
    if (!data.ok || !data.result?.length) {
      return { updates: [], lastUpdateId };
    }

    let newLastId = lastUpdateId;
    const updates = (data.result as any[]).map((upd: any) => {
      if (upd.update_id > newLastId) newLastId = upd.update_id;
      const msg = upd.message || upd.channel_post;
      return {
        updateId: upd.update_id,
        chatId: msg?.chat?.id ?? 0,
        text: msg?.text ?? '',
        username: msg?.from?.username,
        firstName: msg?.from?.first_name,
      };
    }).filter(u => u.chatId !== 0);

    return { updates, lastUpdateId: newLastId };
  } catch {
    return { updates: [], lastUpdateId };
  }
}

/** /start {studentId} buyrug'ini parse qiladi */
export function parseStartCommand(text: string): string | null {
  const match = text.match(/^\/start\s+([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
