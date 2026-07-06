# Brain CRM - Kod Ishga Tushirish (Code Execution) Xizmati

Brain CRM o'quvchilari uchun yozilgan kodlarni tekshirish Piston API orqali amalga oshiriladi. Tashqi Piston xizmatiga qaramlikni yo'qotish va xavfsizlikni oshirish maqsadida, loyiha o'zining shaxsiy Piston Serveri va Node.js proksi API sidan foydalanadi.

## O'rnatish yo'riqnomasi (Production & Local)

### 1. Piston Docker Serverni yurgizish
Piston API ni alohida konteynerda yurgizish kerak. Piston o'quvchi kodini xavfsiz izolyatsiyada (sandbox) ishga tushiradi.

```bash
cd piston-server
docker-compose up -d
```

Piston API sukut bo'yicha `2000` portda ishga tushadi.

### 2. Dasturlash tillarini o'rnatish
Piston server ishga tushgandan so'ng, kerakli tillarni o'rnatish uchun quyidagi scriptni bosing:
```bash
cd piston-server
chmod +x install-runtimes.sh
./install-runtimes.sh
```
*(Bu script faqat Python va Node.js ni o'rnatadi. Agar qo'shimcha tillar kerak bo'lsa, xuddi shu tarzda `docker exec -it piston_api cli/index.js ppman install <til>` qilib qo'shishingiz mumkin).*

### 3. Backend Proxy Serverni yurgizish
API kalitlarni yashirish, rate-limit qo'yish (Daqiqasiga 10 so'rov) va ulanish timeoutlarini boshqarish uchun Node.js Express server yozilgan.

```bash
cd server
npm install
npm run start
```
*Port sukut bo'yicha `4000` da ishlaydi.*

Muhim: `server/.env` faylida Piston serverining tarmog'ini to'g'rilab qo'ying:
```env
PORT=4000
PISTON_API_URL=http://localhost:2000
```

### 4. Frontendni yurgizish
Frontend Vite dagi asosiy loyihadir. U o'zining API chaqiruvlarini `.env` orqali yoki to'g'ridan to'g'ri Localhost 4000 ga yuboradi.

## Xavfsizlik qoidalari
- **Network Izolyatsiyasi:** Piston orqali ishlaydigan kod tashqi tarmoqqa HTTP so'rov yubora olmaydi (Server xavfsizligi).
- **Rate-limit:** Foydalanuvchi Tokeni yoki IP asosida qattiq limitlar qo'yilgan. Server DDoS xurujidan himoyalangan.
- **Iframe Sandbox:** HTML kodi Piston orqali ishlamaydi, to'g'ridan-to'g'ri brauzerda iframe (allow-scripts) orqali ishlaydi. Bu XSS dan himoya qiladi.

## Rollback Rejasi
Agar ishlab turgan server qulasa va darhol o'rni qoplanishi kerak bo'lsa, `src/utils/codeRunner.ts` faylida `API_BASE_URL` o'rniga eskicha API url qaytarilishi mumkin. Biroq eski API public ochiq bo'lmagani uchun, asosiy echim Backend Node.js server loglarini (`pm2 logs`) o'qishdir. Backend server har doim xavfsiz `503` (Xizmat vaqtincha mavjud emas) xatosini qaytarib frontendni buzilishdan saqlaydi.
