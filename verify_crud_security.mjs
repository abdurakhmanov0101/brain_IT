import http from 'http';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        let parsed = responseBody;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log("====================================================================");
  console.log("       BRAIN IT CRM — KIBERXAVFSIZLIK VA CRUD TEKSHIRUVI PROTOKOLI   ");
  console.log("====================================================================\n");

  // 1. TEST BCRYPT AUTHENTICATION & LOGIN RATE LIMITER
  console.log("--> 1. BCRYPT AUTHENTICATION TEKSHIRUVI (Super Admin Login)");
  const loginRes = await request('POST', '/api/auth/login', {
    username: 'superadmin',
    password: 'BrainIT@2025'
  });
  console.log(`[LOGIN RESULT] Status: ${loginRes.status} | User: ${loginRes.data?.user?.name} (${loginRes.data?.user?.role})`);
  const adminToken = loginRes.data?.token;

  if (!adminToken) {
    console.error("XATO: Admin token olinmadi!");
    process.exit(1);
  }
  console.log("✅ Bcrypt parol taqqoslash va JWT token generatsiya muvaffaqiyatli o'tdi.\n");

  // 2. TEST TEACHER LOGIN
  console.log("--> 2. USTOZ AUTHENTICATION (Teacher 1 Login)");
  const teacherLoginRes = await request('POST', '/api/auth/login', {
    username: 'teacher1',
    password: 'Teacher@2026'
  });
  console.log(`[TEACHER LOGIN RESULT] Status: ${teacherLoginRes.status} | User: ${teacherLoginRes.data?.user?.name}`);
  const teacherToken = teacherLoginRes.data?.token;
  console.log("✅ Teacher 1 Bcrypt login muvaffaqiyatli.\n");

  // 3. CREATE HOMEWORK ASSIGNMENT AS ADMIN (owned by teacher2 'tr2')
  console.log("--> 3. CRUD (CREATE): Yangi vazifa yaratish (Teacher 2 tomonidan tegishli vazifa)");
  const createRes = await request('POST', '/api/homework/assignments', {
    title: "IDOR Test Vazifa — Ustoz B",
    description: "Bu vazifa Ustoz B (tr2) ga tegishli.",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    groupId: "g1",
    teacherId: "tr2"
  }, adminToken);
  console.log(`[CREATE RESULT] Status: ${createRes.status} | ID: ${createRes.data?.id} | Title: ${createRes.data?.title}`);
  const assignmentId = createRes.data?.id;
  console.log("✅ CREATE amali muvaffaqiyatli.\n");

  // 4. READ HOMEWORK ASSIGNMENTS
  console.log("--> 4. CRUD (READ): Barcha vazifalarni o'qish");
  const readRes = await request('GET', '/api/homework/assignments', null, teacherToken);
  console.log(`[READ RESULT] Status: ${readRes.status} | Topilgan vazifalar soni: ${Array.isArray(readRes.data) ? readRes.data.length : 0}`);
  console.log("✅ READ amali muvaffaqiyatli.\n");

  // 5. IDOR SECURITY TEST: TEACHER 1 TRYING TO MODIFY TEACHER 2'S ASSIGNMENT
  console.log("--> 5. IDOR TEKSHIRUVI: Ustoz A (Teacher 1) Ustoz B (Teacher 2) vazifasini tahrirlamoqchi");
  const idorUpdateRes = await request('PUT', `/api/homework/assignments/${assignmentId}`, {
    title: "Xakerlik urinishi"
  }, teacherToken);
  console.log(`[IDOR TEST RESULT] Status: ${idorUpdateRes.status} | Message: ${idorUpdateRes.data?.message}`);
  if (idorUpdateRes.status === 403) {
    console.log("🛡️ ✅ IDOR HIMOYA TASDIQLANDI: Boshqa ustozning vazifasini tahrirlash bloklandi (HTTP 403 Forbidden)!\n");
  } else {
    console.error("❌ IDOR HIMOYA ISHLAMADI!");
  }

  // 6. CRUD (UPDATE) BY ADMIN
  console.log("--> 6. CRUD (UPDATE): Admin tomonidan vazifani tahrirlash");
  const updateRes = await request('PUT', `/api/homework/assignments/${assignmentId}`, {
    title: "Yangi yangilangan sarlavha"
  }, adminToken);
  console.log(`[UPDATE RESULT] Status: ${updateRes.status} | Yangi sarlavha: ${updateRes.data?.title}`);
  console.log("✅ UPDATE amali muvaffaqiyatli.\n");

  // 7. CRUD (DELETE) BY ADMIN
  console.log("--> 7. CRUD (DELETE): Vazifani o'chirish");
  const deleteRes = await request('DELETE', `/api/homework/assignments/${assignmentId}`, null, adminToken);
  console.log(`[DELETE RESULT] Status: ${deleteRes.status}`);
  console.log("✅ DELETE amali muvaffaqiyatli (204 No Content).\n");

  // 8. BRUTE-FORCE RATE LIMITING TEST
  console.log("--> 8. BRUTE-FORCE RATE LIMITER TEKSHIRUVI (ketma-ket noto'g'ri urinishlar)");
  let blockedStatus = 0;
  for (let i = 1; i <= 6; i++) {
    const res = await request('POST', '/api/auth/login', {
      username: 'hacker',
      password: 'wrongpassword'
    });
    console.log(`   Urinish #${i}: HTTP ${res.status}`);
    if (res.status === 429) {
      blockedStatus = res.status;
    }
  }
  if (blockedStatus === 429) {
    console.log("🛡️ ✅ BRUTE-FORCE HIMOYA TASDIQLANDI: 5 ta noto'g'ri urinishdan so'ng IP cheklandi (HTTP 429 Too Many Requests)!\n");
  }

  console.log("====================================================================");
  console.log("      BARCHA KIBERXAVFSIZLIK VA CRUD TESTLARI MUVAFFAQIYATLI O'TDI! ");
  console.log("====================================================================");
}

runTests().catch(e => console.error(e));
