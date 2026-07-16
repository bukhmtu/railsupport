# 🚂 RailSupport — To'liq loyiha (Frontend + Supabase)

Temir yo'l IT helpdesk tizimi. React (frontend) + Supabase (Postgres + Auth + Storage + Realtime).

> Eski FastAPI+SQLite backend Supabase'ga ko'chirildi — alohida server hosting kerak emas,
> faqat frontend deploy qilinadi (masalan Netlify). `backend/` papkasi legacy referens sifatida
> diskda qoldi, endi ishlatilmaydi (qarang: `backend/README.md`).

---

## 📁 Tuzilma

```
railsupport-full/
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql      ← jadvallar, RLS, triggerlar, RPC
│   │   └── 0002_storage.sql   ← Storage bucket + fayl uchun RLS
│   ├── functions/admin-users/ ← Edge Function (admin user create/reset/delete)
│   └── seed/                  ← demo ma'lumotlar bilan to'ldirish skripti
├── backend/                   ← ESKI FastAPI backend (endi ishlatilmaydi, legacy)
└── frontend/                  ← React + Vite + TypeScript
    ├── src/lib/supabase.ts    ← Supabase client
    ├── src/api/api.ts         ← Supabase bilan ishlash qatlami
    ├── src/pages/DepartmentsPage.tsx ← Admin: bo'limlarni boshqarish
    └── .env                   ← VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
```

---

## 🚀 O'rnatish (birinchi marta)

### 1-qadam: Supabase loyihasini yaratish

1. [supabase.com](https://supabase.com) da ro'yxatdan o'ting va **New Project** yarating.
2. Loyiha tayyor bo'lgach: **Project Settings → API** bo'limidan quyidagilarni nusxalab oling:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` kalit → `VITE_SUPABASE_ANON_KEY`
   - `service_role` kalit → **hech qachon frontendga qo'ymang**, faqat seed skript va Edge Function uchun kerak bo'ladi.

### 2-qadam: Ma'lumotlar bazasi sxemasi

**Dashboard → SQL Editor** ga o'ting va ketma-ket ishga tushiring:

1. `supabase/migrations/0001_init.sql` — to'liq faylni joylashtirib **Run**.
2. `supabase/migrations/0002_storage.sql` — xuddi shunday **Run**.

Xatosiz bajarilishi kerak. Xato chiqsa — xabarni menga yuboring, birga tuzatamiz.

### 3-qadam: Edge Function deploy qilish (admin foydalanuvchi yaratish uchun)

Kompyuteringizga [Supabase CLI](https://supabase.com/docs/guides/cli) o'rnating, so'ng:

```bash
supabase login
supabase link --project-ref <loyiha-ref>          # Dashboard URL'idagi ID
supabase functions deploy admin-users
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role kalit>
```

> `SUPABASE_URL` va `SUPABASE_ANON_KEY` Edge Function ichida avtomatik mavjud bo'ladi,
> qo'shimcha sozlash shart emas.

### 4-qadam: Demo ma'lumotlar bilan to'ldirish (seed)

```bash
cd supabase/seed
cp .env.example .env
# .env faylida SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY ni to'ldiring
npm install
npm run seed
```

Bu 7 ta demo foydalanuvchi, 8 ta bo'lim va bir nechta demo murojaat yaratadi.

### 5-qadam: Frontend

```bash
cd frontend
cp .env.example .env
# .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni to'ldiring
npm install
npm run dev
```

✅ Frontend: http://localhost:5173

---

## 🔐 Demo login

| Username | Parol | Rol         |
|----------|-------|-------------|
| admin    | 1234  | Admin       |
| disp1    | 1234  | Dispetcher  |
| tech1    | 1234  | Texnik      |
| user1    | 1234  | Xodim       |

Login username bilan qilinadi — orqa fonda `username@railsupport.local` email'ga
avtomatik map qilinadi (Supabase Auth email talab qiladi, lekin foydalanuvchi buni ko'rmaydi).

---

## ✨ Imkoniyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| 🔐 Supabase Auth | Login/sessiya/token yangilash Supabase tomonidan boshqariladi |
| 🛡️ Row Level Security | Har bir rol nima ko'ra olishi DB darajasida ta'minlanadi (server kodisiz ham xavfsiz) |
| 📋 Ticket CRUD | Yaratish, ko'rish, status o'zgartirish |
| 👨‍💼 Biriktirish | Dispatcher texnikga biriktiradi |
| 🏢 Bo'limlar boshqaruvi | **Admin** yangi bo'lim qo'shishi, tahrirlashi, faolligini boshqarishi mumkin |
| 📎 Fayl yuklash | Supabase Storage (private bucket), signed URL orqali ochiladi |
| ⚡ Real-time | Supabase Realtime — yangi/o'zgargan ticketlar RLS asosida filtrlangan holda yetkaziladi |
| 📊 Statistika | SQL orqali hisoblangan agregatsiya (`get_stats` RPC) |
| 📝 Loglar | Barcha harakatlar DB triggerlar orqali avtomatik yoziladi |
| 👥 Foydalanuvchi boshqarish | Admin yangi user qo'shadi (Edge Function), bloklaydi |

---

## 🛠️ Muammo bo'lsa

**"Login yoki parol noto'g'ri" doim chiqadi:**
`supabase/seed` skripti ishga tushirilganiga ishonch hosil qiling — foydalanuvchilar Supabase Auth'da yaratilishi kerak.

**Yangi foydalanuvchi qo'sha olmayapman (403/Ruxsat yo'q):**
Edge Function deploy qilinganiga va `SUPABASE_SERVICE_ROLE_KEY` secret sifatida sozlanganiga ishonch hosil qiling (`supabase secrets list`).

**Fayl yuklab bo'lmayapti:**
`0002_storage.sql` migratsiyasi ishga tushirilganini tekshiring — `attachments` bucket va policy'lar shu yerda yaratiladi.

**CORS/ulanish xatosi:**
`.env` faylida `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` to'g'ri ekanligini tekshiring.
