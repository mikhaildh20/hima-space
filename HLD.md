# HLD — HIMA Space

> **High-Level Design Document**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: PRD v1.0, FSD v1.0

---

## 1. Gambaran Arsitektur

### 1.1 Arsitektur Monolith

HIMA Space menggunakan arsitektur **monolith fullstack** dengan Next.js sebagai core. Alasan: scope kecil, tim kecil, biaya rendah. Satu codebase, satu deployment, satu database.

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│                                                          │
│   ┌─────────────┐  ┌──────────┐  ┌─────────────────┐   │
│   │ Tailwind CSS │  │Vanilla JS│  │ FullCalendar.js │   │
│   │  (Styling)   │  │ (Logic)  │  │   (Kalender)    │   │
│   └──────┬──────┘  └────┬─────┘  └───────┬─────────┘   │
│          │               │                 │             │
│          └───────────────┼─────────────────┘             │
│                          │                               │
│              Fetch API / HTTP Request                    │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SERVER (Next.js App Router)                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE LAYER                  │  │
│  │  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │ verifyToken  │  │ verifyAdmin  │               │  │
│  │  │  (JWT Auth)  │  │ (RBAC)       │               │  │
│  │  └──────────────┘  └──────────────┘               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    API ROUTES                       │  │
│  │  /api/auth/*   /api/ruangan/*   /api/booking/*     │  │
│  │  /api/kalender /api/dashboard                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   SERVICE LAYER                    │  │
│  │  - AuthService     - RuanganService                │  │
│  │  - BookingService  - KalenderService               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   ORM LAYER (Prisma)               │  │
│  │  - Query building   - Migration                   │  │
│  │  - Relation loading - Validation                   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  users   │  │ ruangan  │  │ bookings │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Alur Request/Response

```
User Browser
    │
    ▼
[Request HTTP]
    │
    ├─► [Nginx Reverse Proxy] ──► [Port 3000 / 4000]
    │         │
    │         ▼
    │   [Next.js Server]
    │         │
    │    ┌────┴─────────────┐
    │    │   Route Handler  │
    │    └────┬─────────────┘
    │         │
    │    ┌────┴─────────────┐
    │    │    Middleware     │  ← verifyToken, verifyAdmin
    │    └────┬─────────────┘
    │         │
    │    ┌────┴─────────────┐
    │    │  Service/Logic   │  ← Conflict check, validation
    │    └────┬─────────────┘
    │         │
    │    ┌────┴─────────────┐
    │    │   Prisma Query   │  ← SQL generation
    │    └────┬─────────────┘
    │         │
    │         ▼
    │    [PostgreSQL]
    │         │
    │    ┌────┴─────────────┐
    │    │   Return Data    │
    │    └────┬─────────────┘
    │         │
    │         ▼
    │    [JSON Response]
    │         │
    │         ▼
    └──── [Browser Render]
```

---

## 2. Tech Stack Detail

### 2.1 Stack Summary

| Layer | Teknologi | Versi | Alasan |
|-------|-----------|-------|--------|
| **Runtime** | Node.js | 18.x LTS | Stabil, LTS, Next.js support |
| **Framework** | Next.js | 14.x | App Router, file-based routing, built-in API |
| **ORM** | Prisma | 5.x | Type-safe, migration tool, DX bagus |
| **Database** | PostgreSQL | 15+ | Open source, stabil, relasional |
| **Frontend** | Vanilla JavaScript | ES6+ | Tidak perlu framework berat |
| **CSS** | Tailwind CSS | 3.x | Utility-first, cepat styling |
| **Kalender** | FullCalendar.js | 6.x | Mature, fitur lengkap untuk scheduling |
| **Auth** | jsonwebtoken | 9.x | Stateless, ringan |
| **Password Hash** | bcrypt | 5.x | Industry standard |

### 2.2 Package.json Overview

```json
{
  "name": "hima-space",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "prisma": "^5.14.0",
    "@prisma/client": "^5.14.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@prisma/engines": "^5.14.0"
  }
}
```

---

## 3. Struktur Folder

```
hima-space/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # SQL migrations (auto-generated)
│   └── seed.js                 # Seed data (admin user default)
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirect to /kalender or /login
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   │
│   │   ├── kalender/
│   │   │   └── page.tsx        # Kalender booking (all roles)
│   │   │
│   │   ├── booking/
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Form buat booking
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Detail booking
│   │   │
│   │   ├── histori/
│   │   │   └── page.tsx        # Histori booking (all roles)
│   │   │
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx    # Dashboard admin
│   │       ├── ruangan/
│   │       │   ├── page.tsx    # List ruangan
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       └── approval/
│   │           └── page.tsx    # Daftar booking pending
│   │
│   ├── api/                    # API Routes
│   │   └── route.ts (each)
│   │
│   ├── components/             # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Modal.tsx
│   │   ├── BookingCard.tsx
│   │   ├── StatCard.tsx
│   │   └── ErrorDisplay.tsx
│   │
│   ├── lib/                    # Business logic
│   │   ├── prisma.ts           # Prisma client instance
│   │   ├── auth.ts             # JWT verify, generate
│   │   ├── middleware.ts       # Auth middleware functions
│   │   └── validation.ts       # Validation helpers
│   │
│   ├── services/               # Service layer
│   │   ├── authService.ts
│   │   ├── ruanganService.ts
│   │   ├── bookingService.ts
│   │   └── kalenderService.ts
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css         # Tailwind + custom styles
│
├── public/
│   ├── favicon.ico
│   └── images/
│       └── logo.png
│
├── .env                        # Environment variables
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Database Design

### 4.1 Entity Relationship

```
┌─────────────┐          ┌──────────────┐
│    users    │          │   ruangan    │
├─────────────┤          ├──────────────┤
│ id (PK)     │          │ id (PK)      │
│ nama        │          │ nama         │
│ email       │          │ kapasitas    │
│ password    │          │ fasilitas    │
│ role        │          │ deskripsi    │
│ createdAt   │          │ aktif        │
│ updatedAt   │          │ createdAt    │
└──────┬──────┘          │ updatedAt    │
       │                 └──────┬───────┘
       │ 1                      │ 1
       │ │                      │ │
       │ │                      │ │
       └─┴──────────────────────┴─┘
              │
              │
       ┌──────┴───────┐
       │   bookings   │
       ├──────────────┤
       │ id (PK)      │
       │ judul        │
       │ deskripsi    │
       │ ruanganId(FK)│──► ruangan.id
       │ userId (FK)  │──► users.id
       │ tanggal      │
       │ jamMulai     │
       │ jamSelesai   │
       │ status       │
       │ rejectReason │
       │ createdAt    │
       │ updatedAt    │
       └──────────────┘
```

### 4.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  mahasiswa
}

enum StatusBooking {
  Pending
  Approved
  Rejected
  Cancelled
}

model User {
  id        Int       @id @default(autoincrement())
  nama      String
  email     String    @unique
  password  String    // bcrypt hashed
  role      Role      @default(mahasiswa)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([email])
}

model Ruangan {
  id        Int       @id @default(autoincrement())
  nama      String    @unique
  kapasitas Int
  fasilitas String    // JSON array stored as string
  deskripsi String?
  aktif     Boolean   @default(true)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([aktif])
  @@index([nama])
}

model Booking {
  id           Int            @id @default(autoincrement())
  judul        String
  deskripsi    String?
  ruanganId    Int
  userId       Int
  tanggal      DateTime       // date only, no time
  jamMulai     String         // "HH:mm"
  jamSelesai   String         // "HH:mm"
  status       StatusBooking  @default(Pending)
  rejectReason String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  ruangan Ruangan @relation(fields: [ruanganId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@index([ruanganId, tanggal, status])
  @@index([userId, status])
  @@index([status])
}
```

---

## 5. Modul Internal

### 5.1 Arsitektur Layer

```
┌─────────────────────────────────────────┐
│            PRESENTATION LAYER           │
│  Pages (React Server Components)        │
│  Components (UI)                        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│              API LAYER                  │
│  Route Handlers (Next.js API Routes)    │
│  Input validation, Response formatting  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│             SERVICE LAYER               │
│  AuthService, RuanganService            │
│  BookingService, KalenderService        │
│  Business logic, conflict detection     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│             DATA ACCESS LAYER           │
│  Prisma Client                          │
│  Queries, Transactions, Migrations      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│               DATABASE                  │
│  PostgreSQL                             │
└─────────────────────────────────────────┘
```

### 5.2 Responsibility per Layer

| Layer | Responsibility | Contoh |
|-------|----------------|--------|
| **Presentation** | Render UI, handle user interaction | Form booking, kalender view |
| **API** | Accept request, validate input, call service | `POST /api/booking` |
| **Service** | Business logic, rule enforcement | Deteksi konflik, approval flow |
| **Data Access** | Database queries via Prisma | CRUD operations |
| **Database** | Store data persistently | PostgreSQL |

---

## 6. Integrasi Eksternal

### 6.1 Daftar Integrasi

Untuk MVP, integrasi eksternal sangat minimal:

| Komponen | Tipe | Kebutuhan | Status MVP |
|----------|------|-----------|------------|
| PostgreSQL | Database | Core dependency | ✅ Wajib |
| Cloudflare | CDN/DNS | Domain & SSL | ✅ Recommended |
| Nginx | Reverse Proxy | Aplikasi serving | ✅ Recommended |
| Email Service | Notifikasi | Alert booking | ❌ Out of scope |
| Telegram Bot | Notifikasi | Real-time update | ❌ Out of scope |
| Google Calendar | Sync | Bi-directional sync | ❌ Out of scope |

### 6.2 Cloudflare Integration

```
User Request
    │
    ▼
[Cloudflare DNS]
    │  - SSL termination (Full mode)
    │  - DDoS protection
    │  - Caching static assets
    │
    ▼
[VPS / Origin Server]
    │
    ▼
[Nginx]
    │
    ▼
[Next.js :4000]
```

**Domain Setup:**
- `himaspace.karsa-dev.my.id` → A Record → VPS IP
- SSL: Full (strict) di Cloudflare
- Nginx: listen 80 → redirect to HTTPS, listen 443 → proxy_next

### 6.3 Email / Notifikasi (v2)

Untuk versi mendatang, integrasi yang direncanakan:

| Channel | Provider | Kegunaan |
|---------|----------|----------|
| Telegram Bot | Telegram Bot API | Notifikasi booking baru & approval |
| Email | Nodemailer + Gmail SMTP | Email reminder sebelum booking |

> Notifikasi **tidak ada di MVP**. Fokus utama adalah fungsionalitas inti.

---

## 7. Strategi Deployment

### 7.1 Environment

| Environment | URL | Port | Kegunaan |
|-------------|-----|------|----------|
| **Development** | localhost:3000 | 3000 | Local development |
| **Production** | himaspace.karsa-dev.my.id | 4000 | Live application |

### 7.2 Production Deployment Flow

```
1. Developer push ke GitHub
       │
       ▼
2. Pull di VPS
   $ git pull origin main
       │
       ▼
3. Install dependencies
   $ npm ci
       │
       ▼
4. Run migration
   $ npx prisma migrate deploy
       │
       ▼
5. Build Next.js
   $ npm run build
       │
       ▼
6. Restart service (PM2)
   $ pm2 restart hima-space
       │
       ▼
7. Verify health check
   $ curl http://localhost:4000/api/health
```

### 7.3 PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hima-space',
    script: 'node_modules/.bin/next',
    args: 'start -p 4000',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '300M'
  }]
}
```

### 7.4 Nginx Configuration

```nginx
server {
    listen 80;
    server_name himaspace.karsa-dev.my.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name himaspace.karsa-dev.my.id;

    ssl_certificate     /etc/letsencrypt/live/himaspace.karsa-dev.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/himaspace.karsa-dev.my.id/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:4000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.5 Environment Variables

```bash
# .env (Production)
DATABASE_URL="postgresql://hima_user:password@localhost:5432/hima_space?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NODE_ENV="production"
PORT=4000
```

---

## 8. Security Design

### 8.1 Security Measures

| Layer | Ancaman | Mitigasi |
|-------|---------|----------|
| **Authentication** | Password brute force | Rate limit login (opsional v2), password min 6 char |
| **Authorization** | Role escalation | Middleware verifyAdmin di setiap protected route |
| **Input Validation** | SQL injection | Prisma ORM parameterized queries |
| **Input Validation** | XSS | React auto-escape, sanitize input |
| **Token** | Token theft | HTTPS only, short expiry (24h), localStorage |
| **API** | CSRF | SameSite cookie (opsional), atau localStorage token |
| **Database** | Data breach | PostgreSQL auth, firewall, no public access |
| **Server** | DDoS | Cloudflare protection |

### 8.2 Authentication Flow

```
┌─────────┐        ┌─────────┐        ┌─────────┐
│ Browser │        │  Server │        │   DB    │
└────┬────┘        └────┬────┘        └────┬────┘
     │ POST /api/auth/login                │
     │ email + password  │                 │
     │──────────────────►│                 │
     │                   │ SELECT user WHERE email = ?
     │                   │────────────────►│
     │                   │                 │
     │                   │ ◄───────────────│
     │                   │                 │
     │                   │ bcrypt.compare()│
     │                   │                 │
     │                   │ ┌──────────────┐
     │                   │ │ password ok? │
     │                   │ └──────┬───────┘
     │                   │        │
     │   ┌───────────────│  ┌─────┴─────┐
     │   │               │  │           │
     │   │  NO           │  │  YES      │
     │   │               │  │           │
     │ ◄─┼───────────────│  │           │
     │ 422               │  │           │
     │ "Password salah"  │  │           │
     │                   │  │           │
     │                   │  │ generate JWT
     │                   │  │           │
     │   ◄───────────────│──┘           │
     │ 200 + token       │              │
     │                   │              │
     │ Store token       │              │
     │ (localStorage)    │              │
```

### 8.3 Authorization Flow

```
Request masuk
     │
     ▼
[verifyToken]
     │ - Ambil token dari header Authorization: Bearer xxx
     │ - Decode & verifikasi JWT
     │ - [Invalid] → Return 401
     │ - [Valid] → Set req.user = payload
     │
     ▼
[verifyAdmin] (opsional, hanya untuk route admin)
     │ - Check req.user.role === "admin"
     │ - [Bukan admin] → Return 403
     │
     ▼
[Handler]
     │ - Ejeksi route logic
```

---

## 9. Performance Considerations

### 9.1 Optimasi Database

| Teknik | Penerapan |
|--------|-----------|
| **Indexing** | Index pada `ruanganId + tanggal + status` di bookings |
| **Connection Pooling** | Prisma default pool (size: number of CPU cores) |
| **Select Fields** | Hanya ambil field yang diperlukan |
| **Eager Loading** | Gunakan `include` untuk relasi, hindari N+1 |

### 9.2 Optimasi Frontend

| Teknik | Penerapan |
|--------|-----------|
| **Static Generation** | Halaman statis (login, kalender) bisa di-cache |
| **CDN** | Static assets via Cloudflare |
| **Lazy Load** | Load komponen berat (kalender) secara lazy |
| **CSS Purge** | Tailwind CSS purge unused styles |

### 9.3 Monitoring (v2)

| Metrik | Tool | Kegunaan |
|--------|------|----------|
| Response time | PM2 monitor | Performa API |
| Memory usage | PM2 / htop | Resource monitoring |
| Error rate | Console logs | Debugging |
| Slow queries | Prisma logging | Query optimization |

---

## 10. Development Workflow

### 10.1 Development Setup

```bash
# 1. Clone repository
git clone https://github.com/mike/hima-space.git
cd hima-space

# 2. Install dependencies
npm install

# 3. Setup database
cp .env.example .env
# Edit .env dengan database credentials

# 4. Jalankan migration
npx prisma migrate dev

# 5. Seed database (opsional)
npx prisma db seed

# 6. Jalankan development server
npm run dev
```

### 10.2 Git Workflow

```
main ─────────────────────────────────────────────►
  │
  ├─── feature/auth ──────────────────── merge ─►
  │
  ├─── feature/ruangan-crud ──────────── merge ─►
  │
  ├─── feature/booking ──────────────── merge ─►
  │
  └─── feature/kalender ─────────────── merge ─►
```

**Branch Strategy:**
- `main` — Production-ready code
- `feature/*` — Fitur baru
- `fix/*` — Bug fix
- `chore/*` — Maintenance, deps update

### 10.3 Development Commands

| Command | Kegunaan |
|---------|----------|
| `npm run dev` | Jalankan dev server (port 3000) |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npx prisma migrate dev` | Buat migration baru |
| `npx prisma db push` | Push schema tanpa migration (dev) |
| `npx prisma studio` | GUI database browser |
| `npx prisma generate` | Generate Prisma client |

---

## 11. Error Handling Strategy

### 11.1 Error Categories

| Kategori | Contoh | Response |
|----------|--------|----------|
| **Validation Error** | Field kosong, format salah | 422 + message |
| **Auth Error** | Token expired, tidak ada token | 401 + message |
| **Authorization Error** | Akses role salah | 403 + message |
| **Not Found** | ID tidak ada | 404 + message |
| **Business Logic Error** | Konflik booking | 422 + detail |
| **Server Error** | DB down, crash | 500 + generic message |

### 11.2 Error Response Format

```json
{
  "status": "error",
  "message": "Ruangan sudah dibooking pada waktu tersebut",
  "errors": [
    {
      "field": "jamMulai",
      "message": "Bentrok dengan booking #8 (13:00-15:00)"
    }
  ]
}
```

### 11.3 Error Logging

```typescript
// src/lib/logger.ts
export function logError(error: Error, context: string) {
  console.error(`[${new Date().toISOString()}] ERROR: ${context}`);
  console.error(error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
}
```

---

## 12. Scalability Notes

### 12.1 Current Capacity

| Metrik | Estimate | Keterangan |
|--------|----------|------------|
| Concurrent users | 50-100 | Untuk himpunan/organisasi |
| Database size | < 100MB/tahun | Booking records |
| API response | < 200ms | Simple queries |
| Storage | < 1GB | Tidak ada file upload |

### 12.2 Future Scaling (Jika Diperlukan)

| Kebutuhan | Solusi |
|-----------|--------|
| Lebih banyak user | Vertical scaling (tambah RAM/CPU) |
| Notifikasi real-time | Tambah WebSocket / SSE |
| File upload | Tambah object storage (S3/MinIO) |
| Multi-tenant | Tambah `organisasiId` field |
| Analytics | Tambah database khusus atau caching layer |

---

## 13. Referensi

| Dokumen | Lokasi | Kegunaan |
|---------|--------|----------|
| PRD.md | /root/HIMA-Space/PRD.md | Product Requirements |
| FSD.md | /root/HIMA-Space/FSD.md | Functional Specification |
| HLD.md | /root/HIMA-Space/HLD.md | High-Level Design (dokumen ini) |
| Next.js Docs | https://nextjs.org/docs | Framework reference |
| Prisma Docs | https://www.prisma.io/docs | ORM reference |
| FullCalendar Docs | https://fullcalendar.io/docs | Calendar library reference |

---

*Dokumen ini menjelaskan arsitektur dan desain tingkat tinggi HIMA Space. Untuk detail implementasi, rujuk FSD.md.*
