# TRD — HIMA Space

> **Technical Requirements/Design Document**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: PRD v1.0, FSD v1.0, HLD v1.0

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini mem detailkan aspek teknis implementasi HIMA Space, mencakup:

- Spesifikasi teknis lengkap untuk setiap komponen
- Kontrak API dengan request/response schema
- Algoritma inti (konflik detection, auth, validation)
- Implementasi keamanan
- Strategi caching dan optimasi
- Konfigurasi environment
- Panduan deployment teknis

### 1.2 Prasyarat

| Tool | Versi | Kegunaan |
|------|-------|----------|
| Node.js | 18.x LTS | Runtime |
| PostgreSQL | 14+ | Database |
| npm / pnpm | 8+ / 8+ | Package manager |
| Prisma CLI | 5.x | ORM management |
| PM2 | 5.x | Production process manager |

---

## 2. Database Design — Full Specification

### 2.1 Prisma Schema Lengkap

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

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

// ============================================
// MODELS
// ============================================

model User {
  id        Int       @id @default(autoincrement())
  nama      String
  email     String    @unique
  password  String    // bcrypt hashed, 60 chars
  role      Role      @default(mahasiswa)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("users")
  @@index([email])
}

model Ruangan {
  id        Int       @id @default(autoincrement())
  nama      String    @unique
  kapasitas Int
  fasilitas String    // JSON array: '["AC","Proyektor"]'
  deskripsi String?
  aktif     Boolean   @default(true)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("ruangan")
  @@index([aktif])
  @@index([nama])
}

model Booking {
  id           Int            @id @default(autoincrement())
  judul        String
  deskripsi    String?
  ruanganId    Int
  userId       Int
  tanggal      DateTime       // date only
  jamMulai     String         // "HH:mm" 24h format
  jamSelesai   String         // "HH:mm" 24h format
  status       StatusBooking  @default(Pending)
  rejectReason String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  ruangan Ruangan @relation(fields: [ruanganId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bookings")
  @@index([ruanganId, tanggal, status])  // Conflict detection index
  @@index([userId, status])              // User booking history
  @@index([status])                      // Pending queue
  @@index([tanggal])                     // Dashboard date filter
}
```

### 2.2 Database Diagram (Lengkap)

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS TABLE                          │
├─────────────┬──────────────────┬───────────┬────────────────┤
│ Column      │ Type             │ Nullable  │ Constraint     │
├─────────────┼──────────────────┼───────────┼────────────────┤
│ id          │ INTEGER          │ No        │ PK, AUTO       │
│ nama        │ VARCHAR(100)     │ No        │ —              │
│ email       │ VARCHAR(255)     │ No        │ UNIQUE         │
│ password    │ VARCHAR(60)      │ No        │ bcrypt hash    │
│ role        │ ENUM             │ No        │ DEFAULT=mahasiswa │
│ createdAt   │ TIMESTAMP        │ No        │ DEFAULT=now()  │
│ updatedAt   │ TIMESTAMP        │ No        │ AUTO-UPDATE    │
└─────────────┴──────────────────┴───────────┴────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      BOOKINGS TABLE                         │
├─────────────┬──────────────────┬───────────┬────────────────┤
│ Column      │ Type             │ Nullable  │ Constraint     │
├─────────────┼──────────────────┼───────────┼────────────────┤
│ id          │ INTEGER          │ No        │ PK, AUTO       │
│ judul       │ VARCHAR(200)     │ No        │ —              │
│ deskripsi   │ TEXT             │ Yes       │ —              │
│ ruanganId   │ INTEGER          │ No        │ FK → ruangan.id │
│ userId      │ INTEGER          │ No        │ FK → users.id  │
│ tanggal     │ DATE             │ No        │ —              │
│ jamMulai    │ VARCHAR(5)       │ No        │ "HH:mm"        │
│ jamSelesai  │ VARCHAR(5)       │ No        │ "HH:mm"        │
│ status      │ ENUM             │ No        │ DEFAULT=Pending │
│ rejectReason│ TEXT             │ Yes       │ —              │
│ createdAt   │ TIMESTAMP        │ No        │ DEFAULT=now()  │
│ updatedAt   │ TIMESTAMP        │ No        │ AUTO-UPDATE    │
└─────────────┴──────────────────┴───────────┴────────────────┘
        │
        │ N:1
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      RUANGAN TABLE                          │
├─────────────┬──────────────────┬───────────┬────────────────┤
│ Column      │ Type             │ Nullable  │ Constraint     │
├─────────────┼──────────────────┼───────────┼────────────────┤
│ id          │ INTEGER          │ No        │ PK, AUTO       │
│ nama        │ VARCHAR(100)     │ No        │ UNIQUE         │
│ kapasitas   │ INTEGER          │ No        │ >= 1           │
│ fasilitas   │ VARCHAR(500)     │ No        │ JSON array     │
│ deskripsi   │ TEXT             │ Yes       │ —              │
│ aktif       │ BOOLEAN          │ No        │ DEFAULT=true   │
│ createdAt   │ TIMESTAMP        │ No        │ DEFAULT=now()  │
│ updatedAt   │ TIMESTAMP        │ No        │ AUTO-UPDATE    │
└─────────────┴──────────────────┴───────────┴────────────────┘
```

### 2.3 Index Strategy

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | `users_email_idx` | email | Login lookup |
| ruangan | `ruangan_aktif_idx` | aktif | Filter active rooms |
| ruangan | `ruangan_nama_idx` | nama | Search by name |
| bookings | `bookings_ruangan_tanggal_status_idx` | ruanganId, tanggal, status | **Conflict detection** (critical) |
| bookings | `bookings_user_status_idx` | userId, status | User history query |
| bookings | `bookings_status_idx` | status | Pending queue filter |
| bookings | `bookings_tanggal_idx` | tanggal | Dashboard date filter |

### 2.4 Migration

```bash
# Buat migration baru
npx prisma migrate dev --name init

# Push schema tanpa migration (development)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Lihat database di browser
npx prisma studio
```

---

## 3. API Specification

### 3.1 Konvensi Response

**Success Response:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Human readable error",
  "errors": [
    { "field": "email", "message": "Format email tidak valid" }
  ]
}
```

**Pagination Response:**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 3.2 Endpoint List — Lengkap

#### Auth

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/login` | No | Public | Login user |
| POST | `/api/auth/logout` | Yes | All | Logout (client-side) |
| GET | `/api/auth/me` | Yes | All | Get current user info |

#### Ruangan

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/ruangan` | Yes | All | List semua ruangan |
| GET | `/api/ruangan/:id` | Yes | All | Detail satu ruangan |
| POST | `/api/ruangan` | Yes | Admin | Tambah ruangan |
| PUT | `/api/ruangan/:id` | Yes | Admin | Edit ruangan |
| DELETE | `/api/ruangan/:id` | Yes | Admin | Hapus/nonaktifkan ruangan |

#### Booking

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/booking` | Yes | All* | List booking (own/selalu) |
| GET | `/api/booking/:id` | Yes | All* | Detail booking |
| POST | `/api/booking` | Yes | All | Buat booking baru |
| PATCH | `/api/booking/:id/cancel` | Yes | All* | Batalkan booking |
| GET | `/api/booking/pending` | Yes | Admin | Daftar booking pending |
| PATCH | `/api/booking/:id/approve` | Yes | Admin | Approve booking |
| PATCH | `/api/booking/:id/reject` | Yes | Admin | Reject booking |

> *`All` = mahasiswa hanya lihat milik sendiri, admin bisa lihat semua

#### Kalender

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/kalender` | Yes | All | Data events untuk FullCalendar |

#### Dashboard

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard` | Yes | Admin | Statistik dashboard |

---

### 3.3 Detailed API Contracts

#### POST /api/auth/login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "budi@example.com",
  "password": "password123"
}
```

**Validasi:**
```typescript
// Validation rules
const loginSchema = {
  email: {
    required: true,
    format: 'email',
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 6
  }
};
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nama": "Budi Santoso",
      "email": "budi@example.com",
      "role": "mahasiswa"
    }
  }
}
```

**Error Response (422):**
```json
{
  "status": "error",
  "message": "Email atau password salah"
}
```

**Implementation:**
```typescript
// src/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Email dan password wajib diisi' },
        { status: 422 }
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Email atau password salah' },
        { status: 422 }
      );
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { status: 'error', message: 'Email atau password salah' },
        { status: 422 }
      );
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // 5. Return response
    return NextResponse.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

---

#### POST /api/booking

**Request:**
```http
POST /api/booking
Content-Type: application/json
Authorization: Bearer eyJhbG...

{
  "judul": "Rapat Pengurus HIMA",
  "deskripsi": "Membahas program kerja semester",
  "ruanganId": 1,
  "tanggal": "2026-06-25",
  "jamMulai": "13:00",
  "jamSelesai": "15:00"
}
```

**Validasi:**
```typescript
const bookingSchema = {
  judul: {
    required: true,
    minLength: 3,
    maxLength: 200,
    trim: true
  },
  deskripsi: {
    required: false,
    maxLength: 500
  },
  ruanganId: {
    required: true,
    type: 'number',
    minValue: 1
  },
  tanggal: {
    required: true,
    format: 'YYYY-MM-DD',
    minValue: 'today'  // tidak boleh hari kemarin
  },
  jamMulai: {
    required: true,
    format: 'HH:mm',
    range: '00:00-23:59'
  },
  jamSelesai: {
    required: true,
    format: 'HH:mm',
    range: '00:00-23:59',
    greaterThan: 'jamMulai'  // harus lebih besar dari jamMulai
  }
};
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 10,
    "judul": "Rapat Pengurus HIMA",
    "deskripsi": "Membahas program kerja semester",
    "ruangan": {
      "id": 1,
      "nama": "Ruang HIMA"
    },
    "tanggal": "2026-06-25",
    "jamMulai": "13:00",
    "jamSelesai": "15:00",
    "status": "Pending"
  }
}
```

**Error Response — Konflik (422):**
```json
{
  "status": "error",
  "message": "Ruangan sudah dibooking pada waktu tersebut",
  "data": {
    "conflictWith": [
      {
        "id": 8,
        "judul": "Seminar Akademik",
        "jamMulai": "13:00",
        "jamSelesai": "15:00",
        "status": "Approved"
      }
    ]
  }
}
```

**Implementation:**
```typescript
// src/api/booking/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { status: 'error', message: authResult.error },
        { status: 401 }
      );
    }
    const userId = authResult.user.id;

    // 2. Parse and validate input
    const body = await request.json();
    const { judul, deskripsi, ruanganId, tanggal, jamMulai, jamSelesai } = body;

    // 2a. Required fields
    if (!judul || !ruanganId || !tanggal || !jamMulai || !jamSelesai) {
      return NextResponse.json(
        { status: 'error', message: 'Semua field wajib diisi' },
        { status: 422 }
      );
    }

    // 2b. Judul length
    if (judul.trim().length < 3 || judul.trim().length > 200) {
      return NextResponse.json(
        { status: 'error', message: 'Judul harus 3-200 karakter' },
        { status: 422 }
      );
    }

    // 2c. Validate ruangan exists and active
    const ruangan = await prisma.ruangan.findUnique({
      where: { id: Number(ruanganId) }
    });
    if (!ruangan || !ruangan.aktif) {
      return NextResponse.json(
        { status: 'error', message: 'Ruangan tidak ditemukan atau tidak aktif' },
        { status: 422 }
      );
    }

    // 2d. Validate date format and not in past
    const bookingDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return NextResponse.json(
        { status: 'error', message: 'Tidak bisa booking hari yang sudah lewat' },
        { status: 422 }
      );
    }

    // 2e. Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(jamMulai) || !timeRegex.test(jamSelesai)) {
      return NextResponse.json(
        { status: 'error', message: 'Format jam tidak valid (HH:mm)' },
        { status: 422 }
      );
    }

    // 2f. Validate jamSelesai > jamMulai
    if (jamSelesai <= jamMulai) {
      return NextResponse.json(
        { status: 'error', message: 'Jam selesai harus lebih besar dari jam mulai' },
        { status: 422 }
      );
    }

    // 3. Conflict detection
    const conflict = await prisma.booking.findFirst({
      where: {
        ruanganId: Number(ruanganId),
        tanggal: bookingDate,
        status: 'Approved',
        jamMulai: { lt: jamSelesai },    // existing.start < new.end
        jamSelesai: { gt: jamMulai }      // existing.end > new.start
      },
      select: {
        id: true,
        judul: true,
        jamMulai: true,
        jamSelesai: true,
        status: true
      }
    });

    if (conflict) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Ruangan sudah dibooking pada waktu tersebut',
          data: {
            conflictWith: [conflict]
          }
        },
        { status: 422 }
      );
    }

    // 4. Create booking
    const booking = await prisma.booking.create({
      data: {
        judul: judul.trim(),
        deskripsi: deskripsi?.trim() || null,
        ruanganId: Number(ruanganId),
        userId: userId,
        tanggal: bookingDate,
        jamMulai,
        jamSelesai,
        status: 'Pending'
      },
      include: {
        ruangan: {
          select: { id: true, nama: true }
        }
      }
    });

    // 5. Return response
    return NextResponse.json({
      status: 'success',
      data: booking
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

---

#### GET /api/kalender

**Request:**
```http
GET /api/kalender?ruanganId=1&bulan=6&tahun=2026
Authorization: Bearer eyJhbG...
```

**Query Parameters:**
```typescript
interface KalenderQuery {
  ruanganId?: number;  // Filter per ruangan
  bulan?: number;      // 1-12, default: bulan sekarang
  tahun?: number;      // YYYY, default: tahun sekarang
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "title": "Rapat Pengurus HIMA",
      "start": "2026-06-25T13:00:00",
      "end": "2026-06-25T15:00:00",
      "extendedProps": {
        "bookingId": 10,
        "ruangan": "Ruang HIMA",
        "ruanganId": 1,
        "user": "Budi Santoso",
        "userId": 2,
        "status": "Approved",
        "deskripsi": "Membahas program kerja semester"
      },
      "backgroundColor": "#22c55e",
      "borderColor": "#16a34a",
      "textColor": "#ffffff"
    }
  ]
}
```

**Implementation:**
```typescript
// src/api/kalender/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Color mapping for statuses
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Approved: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  Pending:  { bg: '#eab308', border: '#ca8a04', text: '#000000' },
  Rejected: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  Cancelled: { bg: '#6b7280', border: '#4b5563', text: '#ffffff' }
};

export async function GET(request: Request) {
  try {
    // 1. Verify auth
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { status: 'error', message: authResult.error },
        { status: 401 }
      );
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const ruanganId = searchParams.get('ruanganId');
    const bulan = parseInt(searchParams.get('bulan') || String(new Date().getMonth() + 1));
    const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()));

    // 3. Calculate date range
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59); // Last day of month

    // 4. Build query
    const where: any = {
      tanggal: {
        gte: startDate,
        lte: endDate
      },
      status: { in: ['Approved', 'Pending'] }  // Only show active bookings
    };

    if (ruanganId) {
      where.ruanganId = Number(ruanganId);
    }

    // 5. Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        ruangan: { select: { id: true, nama: true } },
        user: { select: { id: true, nama: true } }
      },
      orderBy: [
        { tanggal: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    // 6. Transform to FullCalendar Event Object format
    const events = bookings.map(booking => {
      const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;
      return {
        id: String(booking.id),
        title: booking.judul,
        start: `${booking.tanggal.toISOString().split('T')[0]}T${booking.jamMulai}:00`,
        end: `${booking.tanggal.toISOString().split('T')[0]}T${booking.jamSelesai}:00`,
        extendedProps: {
          bookingId: booking.id,
          ruangan: booking.ruangan.nama,
          ruanganId: booking.ruangan.id,
          user: booking.user.nama,
          userId: booking.user.id,
          status: booking.status,
          deskripsi: booking.deskripsi
        },
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text
      };
    });

    return NextResponse.json({
      status: 'success',
      data: events
    });

  } catch (error) {
    console.error('Fetch kalender error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
```

---

## 4. Algoritma Inti

### 4.1 Conflict Detection Algorithm

**Purpose:** Mendeteksi apakah booking baru bentrok dengan booking yang sudah ada.

**Algoritma:**
```typescript
async function detectConflict(
  ruanganId: number,
  tanggal: Date,
  jamMulai: string,   // "HH:mm"
  jamSelesai: string  // "HH:mm"
): Promise<Booking | null> {

  // Cari booking yang:
  // 1. Di ruangan yang sama
  // 2. Di tanggal yang sama
  // 3. Status = Approved (hanya ini yang dihitung konflik)
  // 4. Waktu overlap

  const conflict = await prisma.booking.findFirst({
    where: {
      ruanganId: ruanganId,
      tanggal: tanggal,
      status: 'Approved',
      // Time overlap condition:
      // existing.start < new.end AND existing.end > new.start
      AND: [
        { jamMulai: { lt: jamSelesai } },    // existing.start < new.end
        { jamSelesai: { gt: jamMulai } }      // existing.end > new.start
      ]
    }
  });

  return conflict;
}
```

**Visualisasi Logika:**

```
EXISTING BOOKING (Approved)
|◄──────────── 13:00 ─ 15:00 ────────────►|

SCENARIO 1: OVERLAP (CONFLICT)
EXISTING:  |◄──────────── 13:00 ─ 15:00 ────────────►|
NEW:                |◄──────────── 14:00 ─ 16:00 ────────────►|
RESULT:     CONFLICT (overlap 14:00-15:00)

SCENARIO 2: NO OVERLAP
EXISTING:  |◄──────────── 13:00 ─ 15:00 ────────────►|
NEW:                                      |◄──────────── 16:00 ─ 18:00 ────────────►|
RESULT:     NO CONFLICT

SCENARIO 3: EXACT SAME (CONFLICT)
EXISTING:  |◄──────────── 13:00 ─ 15:00 ────────────►|
NEW:        |◄──────────── 13:00 ─ 15:00 ────────────►|
RESULT:     CONFLICT (exact match)

SCENARIO 4: ADJACENT (NO CONFLICT)
EXISTING:  |◄──────────── 13:00 ─ 15:00 ────────────►|
NEW:                                      |◄──── 15:00 ─ 17:00 ──►|
RESULT:     NO CONFLICT (ends at 15:00, starts at 15:00)
```

**Mathematical Condition:**
```
CONFLICT if:
  (existing.jamMulai < new.jamSelesai)
  AND
  (existing.jamSelesai > new.jamMulai)
  AND
  (existing.ruanganId = new.ruanganId)
  AND
  (existing.tanggal = new.tanggal)
  AND
  (existing.status = "Approved")
```

---

### 4.2 Time Validation Algorithm

**Validasi format waktu 24 jam:**
```typescript
function validateTime(time: string): boolean {
  // Format: HH:mm (24h)
  // Range: 00:00 - 23:59
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

function isTimeAfter(time1: string, time2: string): boolean {
  // Return true if time1 > time2
  // Compare as strings works for "HH:mm" format
  return time1 > time2;
}

// Examples:
// validateTime("13:00") → true
// validateTime("25:00") → false
// validateTime("13:00:00") → false (extra seconds)
// isTimeAfter("15:00", "13:00") → true
// isTimeAfter("13:00", "13:00") → false (equal, not after)
```

---

### 4.3 Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Usage:
const hashed = await hashPassword('password123');
// $2b$10$N9qo8uLOickgx2ZMRZoMye...

const isValid = await verifyPassword('password123', hashed);
// true
```

---

### 4.4 JWT Token Management

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = '24h';

interface JWTPayload {
  id: number;
  email: string;
  role: 'admin' | 'mahasiswa';
  iat?: number;
  exp?: number;
}

// Generate token
function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Verify token
function verifyTokenSync(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extract from request
async function verifyToken(request: Request): Promise<{
  error?: string;
  user?: JWTPayload;
}> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Token tidak ditemukan' };
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyTokenSync(token);

  if (!payload) {
    return { error: 'Token tidak valid atau expired' };
  }

  return { user: payload };
}
```

---

## 5. Validation Rules — Complete Reference

### 5.1 Field Validation Matrix

| Entity | Field | Type | Required | Min | Max | Format | Custom Rule |
|--------|-------|------|----------|-----|-----|--------|-------------|
| **User** | email | string | ✅ | — | 255 | email | unique |
| **User** | password | string | ✅ | 6 | 128 | — | bcrypt hash |
| **User** | nama | string | ✅ | 1 | 100 | — | — |
| **Ruangan** | nama | string | ✅ | 1 | 100 | — | unique (case-insensitive) |
| **Ruangan** | kapasitas | number | ✅ | 1 | 1000 | integer | — |
| **Ruangan** | fasilitas | string[] | ❌ | — | 20 items | array | — |
| **Ruangan** | deskripsi | string | ❌ | — | 500 | — | — |
| **Booking** | judul | string | ✅ | 3 | 200 | — | trimmed |
| **Booking** | deskripsi | string | ❌ | — | 500 | — | — |
| **Booking** | ruanganId | number | ✅ | — | — | integer | exists, aktif=true |
| **Booking** | tanggal | string | ✅ | — | — | YYYY-MM-DD | >= today |
| **Booking** | jamMulai | string | ✅ | — | — | HH:mm | 00:00-23:59 |
| **Booking** | jamSelesai | string | ✅ | — | — | HH:mm | > jamMulai |

### 5.2 Validation Functions

```typescript
// src/lib/validation.ts

export class ValidationError extends Error {
  constructor(message: string, public errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} wajib diisi`);
  }
}

export function validateEmail(email: string): void {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new ValidationError('Format email tidak valid');
  }
}

export function validateMinLength(value: string, min: number, fieldName: string): void {
  if (value.length < min) {
    throw new ValidationError(`${fieldName} minimal ${min} karakter`);
  }
}

export function validateMaxLength(value: string, max: number, fieldName: string): void {
  if (value.length > max) {
    throw new ValidationError(`${fieldName} maksimal ${max} karakter`);
  }
}

export function validateTime(time: string): void {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(time)) {
    throw new ValidationError('Format waktu tidak valid (HH:mm)');
  }
}

export function validateDateNotPast(dateStr: string): void {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    throw new ValidationError('Tidak bisa booking hari yang sudah lewat');
  }
}

export function validateTimeAfter(endTime: string, startTime: string): void {
  if (endTime <= startTime) {
    throw new ValidationError('Jam selesai harus lebih besar dari jam mulai');
  }
}
```

---

## 6. Security Implementation

### 6.1 Middleware Stack

```typescript
// src/lib/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

// Middleware for protected routes
export async function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  // Check if token exists
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify token
  const token = authHeader.split(' ')[1];
  const payload = verifyTokenSync(token);

  if (!payload) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Add user to request headers (for downstream use)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.id));
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

// Middleware for admin-only routes
export async function adminMiddleware(request: NextRequest) {
  // First run auth middleware
  const authResponse = await authMiddleware(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  // Check role
  const role = request.headers.get('x-user-role');
  if (role !== 'admin') {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
```

### 6.2 Next.js Middleware Configuration

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/login', '/api/auth/login'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for token
  const token = request.cookies.get('token')?.value ||
                request.headers.get('Authorization')?.split(' ')[1];

  // If no token, redirect to login (for pages) or return 401 (for API)
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token (simplified - in real app, verify JWT)
  const payload = verifyTokenSync(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin routes
  const adminRoutes = ['/admin', '/api/ruangan', '/api/booking/pending', '/api/dashboard'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { status: 'error', message: 'Forbidden' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/kalender', request.url));
  }

  // Add user info to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.id));
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
```

### 6.3 Security Headers

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

---

## 7. Caching Strategy

### 7.1 Cache Layers

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER CACHE                       │
│  - Static assets (JS, CSS, images)                      │
│  - TTL: 1 year (immutable assets)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   CLOUDFLARE CDN                        │
│  - Page cache (HTML pages)                              │
│  - Static assets cache                                  │
│  - TTL: Varies by content type                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     NGINX CACHE                         │
│  - Proxy cache for Next.js responses                    │
│  - Static file serving                                  │
│  - TTL: 1 hour for API, 1 day for static                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION CACHE                     │
│  - In-memory cache (Node.js)                            │
│  - For frequently accessed data                         │
│  - TTL: 5 minutes                                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                            │
│  - PostgreSQL query cache                               │
│  - Connection pool                                      │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Cache Invalidation Strategy

| Data Type | Cache Duration | Invalidation Trigger |
|-----------|----------------|---------------------|
| Static assets | 1 year | File change (hash-based) |
| HTML pages | 1 hour | Revalidate on demand |
| API responses | 5 minutes | Manual invalidation |
| User sessions | 24 hours | Token expiry |
| Database queries | 5 minutes | TTL-based |

### 7.3 Implementation Example

```typescript
// src/lib/cache.ts

const cache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

export function setCache(key: string, data: any, ttlMs: number = 300000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

export function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Usage in API:
export async function GET(request: Request) {
  const cacheKey = `ruangan:${ruanganId}:${bulan}:${tahun}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ status: 'success', data: cached });
  }

  // Fetch from database
  const data = await fetchFromDatabase();

  // Cache for 5 minutes
  setCache(cacheKey, data, 5 * 60 * 1000);

  return NextResponse.json({ status: 'success', data });
}
```

---

## 8. Error Handling Implementation

### 8.1 Global Error Handler

```typescript
// src/lib/errorHandler.ts

import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        errors: error.errors
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        errors: error.errors
      },
      { status: 422 }
    );
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    // Unique constraint violation
    return NextResponse.json(
      {
        status: 'error',
        message: 'Data sudah ada'
      },
      { status: 422 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      status: 'error',
      message: 'Terjadi kesalahan server'
    },
    { status: 500 }
  );
}
```

### 8.2 Error Types Reference

| Error Type | HTTP Status | Example |
|------------|-------------|---------|
| ValidationError | 422 | Field kosong, format salah |
| UnauthorizedError | 401 | Token tidak ada/invalid |
| ForbiddenError | 403 | Role tidak punya akses |
| NotFoundError | 404 | Resource tidak ditemukan |
| ConflictError | 422 | Booking bentrok |
| DatabaseError | 500 | Query gagal |
| UnknownError | 500 | Internal server error |

---

## 9. Performance Optimization

### 9.1 Database Optimization

**Connection Pooling:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool managed by Prisma
  // Default pool size: 10 + number of CPU cores
}
```

**Query Optimization:**
```typescript
// BAD: N+1 query
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const user = await prisma.user.findUnique({ where: { id: booking.userId } });
}

// GOOD: Include relations
const bookings = await prisma.booking.findMany({
  include: {
    user: { select: { id: true, nama: true } },
    ruangan: { select: { id: true, nama: true } }
  }
});

// GOOD: Select only needed fields
const bookings = await prisma.booking.findMany({
  select: {
    id: true,
    judul: true,
    status: true,
    user: { select: { nama: true } }
  }
});
```

**Index Usage:**
```typescript
// This query uses the composite index: bookings_ruangan_tanggal_status_idx
const conflict = await prisma.booking.findFirst({
  where: {
    ruanganId: 1,
    tanggal: new Date('2026-06-25'),
    status: 'Approved',
    jamMulai: { lt: '15:00' },
    jamSelesai: { gt: '13:00' }
  }
});
```

### 9.2 Frontend Optimization

**Code Splitting:**
```typescript
// Dynamic import for heavy components
const FullCalendar = dynamic(() => import('@fullcalendar/react'), {
  ssr: false,
  loading: () => <p>Loading calendar...</p>
});
```

**Image Optimization:**
```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  }
};
```

**Bundle Analysis:**
```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});
```

---

## 10. Deployment Configuration

### 10.1 Environment Variables

```bash
# .env.local (Development)
DATABASE_URL="postgresql://user:password@localhost:5432/hima_space_dev?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# .env.production
DATABASE_URL="postgresql://hima_user:***@localhost:5432/hima_space?schema=public"
JWT_SECRET="[GENERATE RANDOM 64 CHAR STRING]"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://himaspace.karsa-dev.my.id"
```

### 10.2 Production Build

```bash
# 1. Install dependencies
npm ci

# 2. Run Prisma migrations
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Build Next.js
npm run build

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10.3 PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hima-space',
    script: 'node_modules/.bin/next',
    args: 'start -p 4000',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/hima-space/error.log',
    out_file: '/var/log/hima-space/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 10.4 Nginx Config

```nginx
# /etc/nginx/sites-available/himaspace

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name himaspace.karsa-dev.my.id;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name himaspace.karsa-dev.my.id;

    # SSL certificates (Let's Encrypt or Cloudflare)
    ssl_certificate /etc/letsencrypt/live/himaspace.karsa-dev.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/himaspace.karsa-dev.my.id/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:4000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

---

## 11. Monitoring & Logging

### 11.1 Logging Strategy

```typescript
// src/lib/logger.ts

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

function log(level: LogLevel, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    context,
    pid: process.pid
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify(logEntry, null, 2));
  } else {
    // Production: write to file or external service
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  debug: (msg: string, ctx?: any) => log(LogLevel.DEBUG, msg, ctx),
  info: (msg: string, ctx?: any) => log(LogLevel.INFO, msg, ctx),
  warn: (msg: string, ctx?: any) => log(LogLevel.WARN, msg, ctx),
  error: (msg: string, ctx?: any) => log(LogLevel.ERROR, msg, ctx)
};
```

### 11.2 Health Check Endpoint

```typescript
// src/api/health/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }, { status: 503 });
  }
}
```

### 11.3 PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs hima-space

# View process info
pm2 show hima-space

# Restart
pm2 restart hima-space

# Stop
pm2 stop hima-space
```

---

## 12. Testing Strategy

### 12.1 Test Types

| Type | Tool | Coverage |
|------|------|----------|
| Unit Tests | Jest | Business logic, validation |
| Integration Tests | Jest + Supertest | API endpoints |
| E2E Tests | Cypress (optional) | User flows |

### 12.2 Unit Test Example

```typescript
// __tests__/validation.test.ts

import { validateTime, validateEmail } from '@/lib/validation';

describe('Validation', () => {
  describe('validateTime', () => {
    it('should accept valid time', () => {
      expect(validateTime('13:00')).toBe(true);
      expect(validateTime('00:00')).toBe(true);
      expect(validateTime('23:59')).toBe(true);
    });

    it('should reject invalid time', () => {
      expect(validateTime('25:00')).toBe(false);
      expect(validateTime('13:60')).toBe(false);
      expect(validateTime('13:00:00')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });
});
```

### 12.3 Integration Test Example

```typescript
// __tests__/api/booking.test.ts

import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/booking/route';

describe('POST /api/booking', () => {
  it('should create booking successfully', async () => {
    const request = new Request('http://localhost/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        judul: 'Rapat Pengurus',
        ruanganId: 1,
        tanggal: '2026-06-25',
        jamMulai: '13:00',
        jamSelesai: '15:00'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.status).toBe('success');
    expect(data.data.judul).toBe('Rapat Pengurus');
  });

  it('should return 422 on conflict', async () => {
    // Test conflict detection
  });
});
```

---

## 13. Deployment Checklist

### 13.1 Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Prisma schema up to date
- [ ] Build successful (`npm run build`)
- [ ] No security vulnerabilities (`npm audit`)

### 13.2 Deployment Steps

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Build application**
   ```bash
   npm run build
   ```

5. **Restart PM2 process**
   ```bash
   pm2 restart hima-space
   ```

6. **Verify health**
   ```bash
   curl http://localhost:4000/api/health
   ```

### 13.3 Post-Deployment

- [ ] Health check passing
- [ ] Login works
- [ ] CRUD operations work
- [ ] Booking flow works
- [ ] Calendar displays correctly
- [ ] No errors in logs

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Prisma** | TypeScript ORM for Node.js |
| **JWT** | JSON Web Token - stateless authentication |
| **bcrypt** | Password hashing algorithm |
| **RBAC** | Role-Based Access Control |
| **CDN** | Content Delivery Network |
| **PM2** | Node.js process manager |
| **TTL** | Time-To-Live (cache duration) |
| **N+1 Query** | Performance anti-pattern: multiple queries instead of one |
| **Composite Index** | Index on multiple columns |

---

*Dokumen ini bersifat teknis dan menjadi acuan implementasi. Perubahan pada spesifikasi teknis harus diikuti dengan update dokumen ini.*
