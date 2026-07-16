# RailSupport — Backend API (LEGACY — endi ishlatilmaydi)

> ⚠️ Bu backend Supabase'ga ko'chirildi va endi loyiha tomonidan ishlatilmaydi.
> Frontend endi to'g'ridan-to'g'ri Supabase (Postgres + Auth + Storage + Realtime) bilan ishlaydi —
> qarang: repo ildizidagi `README.md` va `supabase/` papkasi.
> Bu fayl faqat eski API'ning tuzilishini referens sifatida saqlab qolish uchun qoldirilgan.

**FastAPI + SQLite + WebSocket + File Upload**

---

## 📁 Loyiha tuzilmasi

```
railsupport-backend/
├── app/
│   ├── main.py              ← Asosiy FastAPI app
│   ├── seed.py              ← Boshlang'ich ma'lumotlar
│   ├── core/
│   │   ├── config.py        ← .env sozlamalari
│   │   ├── database.py      ← SQLite ulanish
│   │   ├── security.py      ← JWT + bcrypt + role tekshirish
│   │   └── websocket.py     ← Real-time manager
│   ├── models/
│   │   ├── user.py          ← User jadvali
│   │   ├── ticket.py        ← Ticket + Attachment jadvallar
│   │   └── log.py           ← Log jadvali
│   ├── routers/
│   │   ├── auth.py          ← /auth/login, /auth/me
│   │   ├── tickets.py       ← /tickets/ (CRUD + file upload)
│   │   ├── users.py         ← /users/ (faqat admin)
│   │   ├── stats.py         ← /stats, /logs
│   │   └── ws.py            ← WebSocket /ws
│   └── schemas/
│       └── __init__.py      ← Pydantic modellar
├── frontend-api-client/
│   └── api.ts               ← Frontend uchun API client
├── uploads/                 ← Yuklangan fayllar saqlanadi
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🚀 O'rnatish va ishga tushirish

### 1. Virtual muhit yaratish

```bash
cd railsupport-backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Kutubxonalarni o'rnatish

```bash
pip install -r requirements.txt
# pydantic-settings alohida kerak:
pip install pydantic-settings
```

### 3. .env fayl yaratish

```bash
cp .env.example .env
# .env faylini oching va SECRET_KEY ni o'zgartiring!
```

### 4. Ma'lumotlar bazasini to'ldirish

```bash
python -m app.seed
```

Bu buyruq `railsupport.db` faylini yaratadi va demo foydalanuvchilarni qo'shadi.

### 5. Serverni ishga tushirish

```bash
uvicorn app.main:app --reload --port 8000
```

Server `http://localhost:8000` da ishlaydi.

**Swagger UI:** http://localhost:8000/docs

---

## 🔐 Demo login ma'lumotlari

| Username | Parol | Rol         |
|----------|-------|-------------|
| admin    | 1234  | Admin       |
| disp1    | 1234  | Dispetcher  |
| tech1    | 1234  | Texnik      |
| user1    | 1234  | Xodim       |

---

## 📡 API Endpointlar

### Auth
| Method | URL         | Kim uchun |
|--------|-------------|-----------|
| POST   | /auth/login | Hammaga   |
| GET    | /auth/me    | Kirgan    |

### Ticketlar
| Method | URL                              | Kim uchun              |
|--------|----------------------------------|------------------------|
| GET    | /tickets/                        | Hammaga (filtrlangan)  |
| GET    | /tickets/{id}                    | Hammaga                |
| POST   | /tickets/                        | Hammaga                |
| PATCH  | /tickets/{id}/assign             | Dispetcher, Admin      |
| PATCH  | /tickets/{id}/status             | Texnik, Dispetcher, Admin |
| POST   | /tickets/{id}/attachments        | Hammaga                |
| DELETE | /tickets/{id}/attachments/{attId}| Admin, Dispetcher      |

### Foydalanuvchilar
| Method | URL           | Kim uchun        |
|--------|---------------|------------------|
| GET    | /users/       | Admin, Dispetcher|
| POST   | /users/       | Admin            |
| PATCH  | /users/{id}   | Admin            |
| DELETE | /users/{id}   | Admin            |

### Statistika
| Method | URL     | Kim uchun         |
|--------|---------|-------------------|
| GET    | /stats  | Admin, Dispetcher |
| GET    | /logs   | Admin             |

### WebSocket
```
ws://localhost:8000/ws?token=<JWT_TOKEN>
```

**Eventlar (serverdan):**
- `connected` — ulandi
- `ticket:new` — yangi ticket yaratildi
- `ticket:updated` — ticket o'zgardi
- `ticket:assigned` — sizga ticket biriktirildi

---

## 🔗 Frontend bilan bog'lash

### 1. API clientni ko'chirish

`frontend-api-client/api.ts` faylini frontendning `src/api/api.ts` ga ko'chiring.

### 2. .env frontendda

`railsupport-v4/.env.local` faylini yarating:
```
VITE_API_URL=http://localhost:8000
```

### 3. App.tsx da o'zgarishlar

`constants.ts` dagi hardcoded ma'lumotlar o'rniga API dan oling:

```typescript
import { api, createWebSocket } from "./api/api";

// Login:
const { user } = await api.login(username, password);

// Ticketlar:
const tickets = await api.tickets.list();

// WebSocket:
const ws = createWebSocket({
  "ticket:new":     (data) => setTickets(p => [data, ...p]),
  "ticket:updated": (data) => setTickets(p => p.map(t => t.id === data.id ? data : t)),
});
```

---

## 🛡️ Xavfsizlik yaxshilanishlari

Eski frontendga nisbatan:

| Muammo | Yechim |
|--------|--------|
| Parollar ochiq matnda | bcrypt hash |
| Frontend da USERS massivi | Faqat server biladi |
| Brauzer yopilsa ma'lumot yo'qoladi | SQLite da saqlanadi |
| Rol tekshiruvi yo'q | JWT + backend RBAC |
| Real-time yo'q | WebSocket |
| Fayl yuklash yo'q | Multipart upload |
