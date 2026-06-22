# FSD — HIMA Space

> **Functional Specification Document**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: PRD.md v1.0

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini menjelaskan secara detail bagaimana setiap fitur HIMA Space akan berfungsi. FSD ini menjadi acuan utama bagi developer saat implementasi — mencakup input/output, logika bisnis, validasi, alur kerja, dan response yang diharapkan.

### 1.2 Scope

Dokumen ini mencakup seluruh fungsionalitas MVP HIMA Space, yaitu:

1. Autentikasi (Login & Logout)
2. Manajemen Ruangan (CRUD Admin)
3. Booking Ruangan
4. Approval Booking (Admin)
5. Kalender Booking
6. Dashboard

### 1.3 Konvensi

| Istilah | Arti |
|---------|------|
| **User** | Pengguna umum (belum login) |
| **Mahasiswa** | User yang sudah login dengan role `mahasiswa` |
| **Admin** | User yang sudah login dengan role `admin` |
| **401** | HTTP 401 Unauthorized (perlu login) |
| **403** | HTTP 403 Forbidden (tidak punya akses) |
| **404** | HTTP 404 Not Found |
| **422** | HTTP 422 Unprocessable Entity (validasi gagal) |

---

## 2. Autentikasi

### 2.1 Flow Login

**Endpoint:** `POST /api/auth/login`

**Input:**

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| email | string | Ya | Format email valid |
| password | string | Ya | Min 6 karakter |

**Proses:**

```
1. User input email & password → submit
2. Sistem cari user WHERE email = input.email
3. [Not Found] → Return 404 + error "Email tidak terdaftar"
4. [Found] → Verifikasi password dengan bcrypt
5. [Password salah] → Return 422 + error "Password salah"
6. [Password benar] → Generate JWT token (exp: 24 jam)
7. Return 200 + { token, user: { id, nama, email, role } }
```

**Output (success):**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "nama": "Budi Santoso",
      "email": "budi@example.com",
      "role": "mahasiswa"
    }
  }
}
```

**Output (error):**

```json
{
  "status": "error",
  "message": "Email tidak terdaftar"
}
```

### 2.2 Flow Logout

**Endpoint:** `POST /api/auth/logout`

**Input:** None (client cukup hapus token dari localStorage/cookie)

**Proses:** 
Client-side: hapus token, redirect ke halaman login.
Server-side: JWT bersifat stateless — tidak ada session di server. Blacklist token opsional di v2.

**Output:**

```json
{
  "status": "success",
  "message": "Berhasil logout"
}
```

### 2.3 Middleware Auth

**Penerapan:**

| Path | Middleware | Keterangan |
|------|-----------|------------|
| `POST /api/auth/login` | None | Public |
| `GET /api/*` | verifyToken | Semua endpoint API dilindungi |
| `POST /api/ruangan/*` | verifyToken + verifyAdmin | CRUD ruangan khusus admin |
| `PUT /api/ruangan/*` | verifyToken + verifyAdmin | — |
| `DELETE /api/ruangan/*` | verifyToken + verifyAdmin | — |
| `GET /api/booking/pending` | verifyToken + verifyAdmin | Hanya admin lihat pending |
| `GET /api/dashboard` | verifyToken + verifyAdmin | Dashboard khusus admin |

**Middleware verifyToken:**

```
1. Ambil header Authorization: Bearer <token>
2. [No header] → Return 401 + "Token tidak ditemukan"
3. Decode & verifikasi JWT
4. [Invalid/expired] → Return 401 + "Token tidak valid / expired"
5. [Valid] → req.user = { id, role } → next()
```

**Middleware verifyAdmin:**

```
1. Check req.user.role === "admin"
2. [Bukan admin] → Return 403 + "Akses ditolak"
3. [Admin] → next()
```

### 2.4 JWT Payload

```json
{
  "id": 1,
  "email": "budi@example.com",
  "role": "mahasiswa",
  "iat": 1749600000,
  "exp": 1749686400
}
```

- **exp:** 24 jam dari waktu login
- **Secret:** disimpan di env variable `JWT_SECRET`

### 2.5 Halaman yang Dilindungi

| Halaman | Conditional |
|---------|-------------|
| `/login` | Jika sudah login → redirect ke `/dashboard` (admin) atau `/kalender` (mahasiswa) |
| `/dashboard` (admin) | Jika role != admin → redirect ke `/kalender` |
| `/kelola-ruangan` | Jika role != admin → redirect ke `/kalender` |
| `/kalender` | Semua role bisa akses |
| `/histori` | Semua role bisa akses (tapi hanya lihat milik sendiri) |

---

## 3. Manajemen Ruangan (Admin Only)

### 3.1 Model Data

```typescript
// Prisma Schema
model Ruangan {
  id          Int       @id @default(autoincrement())
  nama        String    @unique
  kapasitas   Int
  fasilitas   String    // JSON array: ["AC", "Proyektor", "Whiteboard"]
  deskripsi   String?   // nullable
  aktif       Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}
```

### 3.2 CRUD Ruangan

#### GET /api/ruangan — Daftar Semua Ruangan

**Middleware:** verifyToken

**Proses:**

```
1. Ambil semua data dari tabel Ruangan
2. [Query param ?all=true]: ambil termasuk yang nonaktif
3. [Default]: hanya yang aktif (WHERE aktif = true)
4. Urutkan berdasarkan nama ASC
```

**Output:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "Ruang HIMA",
      "kapasitas": 30,
      "fasilitas": ["AC", "Proyektor", "Whiteboard"],
      "deskripsi": "Ruang utama himpunan",
      "aktif": true,
      "totalBookingHariIni": 3
    }
  ]
}
```

#### GET /api/ruangan/:id — Detail Ruangan

**Middleware:** verifyToken

**Proses:**

```
1. Cari ruangan WHERE id = params.id
2. [Not Found] → 404
3. Return data ruangan
```

**Output (success):**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "nama": "Ruang HIMA",
    "kapasitas": 30,
    "fasilitas": ["AC", "Proyektor", "Whiteboard"],
    "deskripsi": "Ruang utama himpunan",
    "aktif": true,
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

#### POST /api/ruangan — Tambah Ruangan

**Middleware:** verifyToken + verifyAdmin

**Input:**

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| nama | string | Ya | 1-100 karakter, unik (case-insensitive) |
| kapasitas | number | Ya | >= 1 |
| fasilitas | string[] | Tidak | Array string (default: []) |
| deskripsi | string | Tidak | Max 500 karakter |

**Proses:**

```
1. Validasi input
2. [Nama sudah dipakai] → Return 422 + "Nama ruangan sudah ada"
3. [Kapasitas < 1] → Return 422 + "Kapasitas minimal 1"
4. Simpan ke database
5. Return 201 + data ruangan baru
```

**Output:**

```json
{
  "status": "success",
  "data": {
    "id": 2,
    "nama": "Aula Serbaguna",
    "kapasitas": 50,
    "fasilitas": ["AC", "Sound System"],
    "deskripsi": null,
    "aktif": true
  }
}
```

#### PUT /api/ruangan/:id — Edit Ruangan

**Middleware:** verifyToken + verifyAdmin

**Input:** Sama seperti POST, tapi semua field opsional (partial update).

**Proses:**

```
1. Cari ruangan WHERE id = params.id
2. [Not Found] → 404
3. Validasi input yang dikirim
4. [Nama baru sudah dipakai ruangan lain] → 422
5. Update di database
6. Return data yang sudah diupdate
```

**Output:**

```json
{
  "status": "success",
  "data": {
    "id": 2,
    "nama": "Aula Serbaguna (Diperbarui)",
    "kapasitas": 60,
    "fasilitas": ["AC", "Sound System", "Proyektor"],
    "deskripsi": null,
    "aktif": true
  }
}
```

#### DELETE /api/ruangan/:id — Hapus / Nonaktifkan Ruangan

**Middleware:** verifyToken + verifyAdmin

**Proses:**

```
1. Cari ruangan WHERE id = params.id
2. [Not Found] → 404
3. [Ada booking Approved hari ini/tidak bisa dihapus] → nonaktifkan saja (aktif = false)
4. [Tidak ada booking terkait] → hapus permanent
5. Return sukses
```

> **Catatan:** Hapus fisik dilakukan hanya jika ruangan tidak memiliki booking sama sekali. Jika memiliki histori booking (termasuk masa lalu), cukup nonaktifkan dengan `aktif = false`.

**Output:**

```json
{
  "status": "success",
  "message": "Ruangan berhasil dinonaktifkan"
}
```

---

## 4. Booking Ruangan

### 4.1 Model Data

```typescript
model Booking {
  id            Int       @id @default(autoincrement())
  judul         String
  deskripsi     String?
  ruanganId     Int
  userId        Int
  tanggal       DateTime  // only date part
  jamMulai      String    // format: "HH:mm" (24h)
  jamSelesai    String    // format: "HH:mm" (24h)
  status        Status    // Pending | Approved | Rejected | Cancelled
  rejectReason  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  ruangan       Ruangan   @relation(fields: [ruanganId], references: [id])
  user          User      @relation(fields: [userId], references: [id])

  @@unique([ruanganId, tanggal, jamMulai, jamSelesai, status]) // optional, prevent exact duplicate
}

enum Status {
  Pending
  Approved
  Rejected
  Cancelled
}
```

### 4.2 Flow Buat Booking

**Endpoint:** `POST /api/booking`

**Middleware:** verifyToken

**Input:**

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| judul | string | Ya | 3-200 karakter |
| deskripsi | string | Tidak | Max 500 karakter |
| ruanganId | number | Ya | Harus ID ruangan yang ada & aktif |
| tanggal | string (date) | Ya | Format YYYY-MM-DD, tidak boleh hari kemarin |
| jamMulai | string (time) | Ya | Format HH:mm, range 00:00-23:59 |
| jamSelesai | string (time) | Ya | Format HH:mm, harus > jamMulai |

**Validasi Berantai:**

```
1. Validasi field dasar (required, format)
2. Ruangan exists & aktif?
   ├─ Tidak → 404 / 422 "Ruangan tidak ditemukan / tidak aktif"
3. Tanggal tidak boleh kemarin
   ├─ Tanggal < hari ini → 422 "Tidak bisa booking hari kemarin"
4. jamSelesai > jamMulai?
   ├─ Tidak → 422 "Jam selesai harus setelah jam mulai"
5. Cek konflik:
   Cari booking dengan kondisi:
     - ruanganId = input.ruanganId
     - tanggal = input.tanggal
     - status = "Approved"  (hanya Approved yang dianggap konflik)
     - jamMulai < input.jamSelesai
     - jamSelesai > input.jamMulai
   ├─ Ada konflik → 422 + daftar booking yang bentrok
   └─ Tidak ada → Lanjut
6. Simpan booking dengan status "Pending", userId dari token
7. Return 201
```

**Deteksi Konflik — Detail Logika:**

```
BOOKING_EXISTING.jamMulai < BOOKING_BARU.jamSelesai
DAN
BOOKING_EXISTING.jamSelesai > BOOKING_BARU.jamMulai
DAN
BOOKING_EXISTING.ruanganId = BOOKING_BARU.ruanganId
DAN
BOOKING_EXISTING.tanggal = BOOKING_BARU.tanggal
DAN
BOOKING_EXISTING.status = "Approved"
```

**Contoh Kasus Konflik:**

| Existing | Baru | Konflik? | Alasan |
|----------|------|----------|--------|
| 13:00-15:00 | 14:00-16:00 | ✅ Ya | Ada overlap 14:00-15:00 |
| 13:00-15:00 | 10:00-12:00 | ❌ Tidak | Sepenuhnya di luar |
| 13:00-15:00 | 13:00-15:00 | ✅ Ya | Waktu sama persis |
| 13:00-15:00 (Rejected) | 13:00-15:00 | ❌ Tidak | Status Rejected tidak dihitung |
| 08:00-10:00 | 10:00-12:00 | ❌ Tidak | Tepat bersebelahan (sampai 10:00, mulai 10:00) |

**Output (success):**

```json
{
  "status": "success",
  "data": {
    "id": 10,
    "judul": "Rapat Pengurus HIMA",
    "ruangan": { "id": 1, "nama": "Ruang HIMA" },
    "tanggal": "2026-06-25",
    "jamMulai": "13:00",
    "jamSelesai": "15:00",
    "status": "Pending"
  }
}
```

**Output (konflik):**

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

### 4.3 Flow Batalkan Booking

**Endpoint:** `PATCH /api/booking/:id/cancel`

**Middleware:** verifyToken

**Proses:**

```
1. Cari booking WHERE id = params.id
2. [Not Found] → 404
3. Cek kepemilikan:
   ├─ req.user.role = "admin" → lanjut (admin bisa cancel semua)
   ├─ req.user.id = booking.userId → lanjut (pemilik)
   └─ req.user.role = "mahasiswa" && req.user.id != booking.userId → 403 "Bukan booking kamu"
4. Cek status:
   ├─ status = "Approved" → boleh cancel
   ├─ status = "Pending" → boleh cancel
   ├─ status = "Rejected" → 422 "Booking sudah ditolak, tidak bisa dibatalkan"
   └─ status = "Cancelled" → 422 "Booking sudah dibatalkan sebelumnya"
5. Update status = "Cancelled"
6. Return sukses
```

**Output:**

```json
{
  "status": "success",
  "message": "Booking berhasil dibatalkan",
  "data": {
    "id": 10,
    "status": "Cancelled"
  }
}
```

### 4.4 Flow Lihat Booking

#### GET /api/booking — Daftar Booking Sendiri (Mahasiswa)

**Middleware:** verifyToken

**Query Params:**

| Param | Type | Default | Keterangan |
|-------|------|---------|------------|
| status | string | all | Filter: pending, approved, rejected, cancelled |
| page | number | 1 | Pagination |
| limit | number | 10 | Items per page |

**Proses:**

```
1. [Role mahasiswa]: WHERE userId = req.user.id
2. [Role admin]: WHERE ALL (tanpa filter user) + query param ?userId=n optional
3. Include relasi ruangan (nama, kapasitas)
4. Urutkan: tanggal DESC, jamMulai DESC
5. Pagination (default: 10 per page)
```

**Output:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "judul": "Rapat Pengurus",
      "ruangan": { "id": 1, "nama": "Ruang HIMA" },
      "tanggal": "2026-06-25",
      "jamMulai": "13:00",
      "jamSelesai": "15:00",
      "status": "Pending",
      "createdAt": "2026-06-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET /api/booking/:id — Detail Booking

**Middleware:** verifyToken

**Proses:**

```
1. Cari booking WHERE id = params.id (include user, ruangan)
2. [Not Found] → 404
3. [Role mahasiswa && booking.userId != req.user.id] → 403 "Bukan booking kamu"
4. [Admin] → bebas lihat semua
5. Return detail
```

**Output:**

```json
{
  "status": "success",
  "data": {
    "id": 10,
    "judul": "Rapat Pengurus HIMA",
    "deskripsi": "Membahas program kerja semester",
    "ruangan": {
      "id": 1,
      "nama": "Ruang HIMA",
      "kapasitas": 30,
      "fasilitas": ["AC", "Proyektor"]
    },
    "user": {
      "id": 2,
      "nama": "Budi Santoso",
      "email": "budi@example.com"
    },
    "tanggal": "2026-06-25",
    "jamMulai": "13:00",
    "jamSelesai": "15:00",
    "status": "Pending",
    "rejectReason": null,
    "createdAt": "2026-06-22T10:00:00.000Z",
    "updatedAt": "2026-06-22T10:00:00.000Z"
  }
}
```

---

## 5. Approval Booking (Admin Only)

### 5.1 Flow Approve

**Endpoint:** `PATCH /api/booking/:id/approve`

**Middleware:** verifyToken + verifyAdmin

**Input:** None (tidak perlu body, tidak ada biaya tambahan)

**Proses:**

```
1. Cari booking WHERE id = params.id
2. [Not Found] → 404
3. [Status != "Pending"] → 422 "Hanya booking dengan status Pending yang bisa diapprove"
4. Konflik check ulang:
   (Sama seperti 4.2 step 5 — untuk antisipasi approve dari booking yang sudah
    tervalidasi sebelumnya, tapi ada booking Approved lain yang bentrok terlanjur masuk)
   ├─ Ada konflik → 422 "Tidak bisa approve karena bentrok dengan booking lain"
   └─ Tidak ada → Lanjut
5. Update status = "Approved"
6. Return sukses
```

> **Kenapa perlu konflik check ulang?** Karena ada skenario: booking A (Pending), booking B (Pending). Admin approve A dulu → status A = Approved. Lalu admin approve B → sistem harus ngecek ulang apakah B masih aman, karena A sudah Approved di antara waktu.

**Output:**

```json
{
  "status": "success",
  "message": "Booking berhasil diapprove",
  "data": {
    "id": 10,
    "status": "Approved"
  }
}
```

### 5.2 Flow Reject

**Endpoint:** `PATCH /api/booking/:id/reject`

**Middleware:** verifyToken + verifyAdmin

**Input:**

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| alasan | string | Tidak | Max 500 karakter, optional |

**Proses:**

```
1. Cari booking WHERE id = params.id
2. [Not Found] → 404
3. [Status != "Pending"] → 422 "Hanya booking dengan status Pending yang bisa direject"
4. Update status = "Rejected", simpan rejectReason jika ada
5. Return sukses
```

**Output:**

```json
{
  "status": "success",
  "message": "Booking berhasil direject",
  "data": {
    "id": 10,
    "status": "Rejected",
    "rejectReason": "Jadwal sudah dipakai untuk acara kampus"
  }
}
```

### 5.3 GET /api/booking/pending — Daftar Booking Pending (Admin)

**Middleware:** verifyToken + verifyAdmin

**Proses:**

```
1. Ambil booking WHERE status = "Pending"
2. Urutkan: tanggal ASC, jamMulai ASC (yang paling lama duluan)
3. Include relasi user & ruangan
4. Return daftar
```

**Output:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "judul": "Rapat Pengurus",
      "user": { "id": 2, "nama": "Budi Santoso" },
      "ruangan": { "id": 1, "nama": "Ruang HIMA" },
      "tanggal": "2026-06-25",
      "jamMulai": "13:00",
      "jamSelesai": "15:00",
      "createdAt": "2026-06-22T10:00:00.000Z"
    }
  ]
}
```

---

## 6. Kalender Booking

### 6.1 Endpoint Data Kalender

**Endpoint:** `GET /api/kalender?ruanganId=1&bulan=6&tahun=2026`

**Middleware:** verifyToken

**Query Params:**

| Param | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| ruanganId | number | Tidak | All ruangan aktif | Filter per ruangan |
| bulan | number | Tidak | Bulan sekarang | 1-12 |
| tahun | number | Tidak | Tahun sekarang | YYYY |

**Proses:**

```
1. Tentukan range tanggal (1 - akhir bulan)
2. Ambil booking dalam range tsb, WHERE status IN ("Pending", "Approved")
   (Rejected & Cancelled tidak ditampilkan di kalender utama — opsional jika ingin
    dimunculkan redup/dim bisa di v2)
3. Include relasi user (nama) dan ruangan (nama, warna)
4. Format untuk FullCalendar.js (Event Object format)
5. Return array events
```

**Output (FullCalendar Event Object Array):**

```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "title": "Rapat Pengurus",
      "start": "2026-06-25T13:00:00",
      "end": "2026-06-25T15:00:00",
      "extendedProps": {
        "ruangan": "Ruang HIMA",
        "ruanganId": 1,
        "user": "Budi Santoso",
        "userId": 2,
        "status": "Approved",
        "deskripsi": "Membahas program kerja"
      },
      "backgroundColor": "#22c55e",
      "borderColor": "#16a34a",
      "textColor": "#ffffff"
    }
  ]
}
```

**Color Coding (Status):**

| Status | Warna | Hex |
|--------|-------|-----|
| Approved | Hijau | `#22c55e` |
| Pending | Kuning | `#eab308` |
| Rejected | Merah (tidak ditampilkan di kalender utama) | `#ef4444` |
| Cancelled | Abu (tidak ditampilkan di kalender utama) | `#6b7280` |

### 6.2 Integrasi FullCalendar.js

**Konfigurasi:**

```javascript
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  events: '/api/kalender?idRuangan=1&bulan=6&tahun=2026',
  eventClick: function(info) {
    // Tampilkan modal detail booking
  },
  selectable: true,
  select: function(info) {
    // Buka form booking (isi tanggal & jam otomatis)
  }
});
```

**Behavior:**

| Aksi | Hasil |
|------|-------|
| **Klik event** | Buka modal detail booking (judul, pemesan, status, waktu) |
| **Pilih slot waktu** | Buka form booking dengan tanggal & jam otomatis terisi |
| **Navigasi bulan** | Fetch ulang data events |
| **Filter ruangan** | Dropdown ruangan → fetch ulang dengan ruanganId tertentu |
| **Hari ini** | Tombol "Today" — balik ke bulan & tanggal sekarang |

### 6.3 Slot Booking (Quick Book)

Fitur ini memungkinkan user klik pada grid kalender untuk langsung booking:

```
1. User klik/drag pada kalender → select area (tanggal, jamMulai, jamSelesai)
2. Muncul modal form booking (field sudah terisi tanggal & jam)
3. User isi judul → submit
4. Flow booking standar (cek konflik, dll)
```

---

## 7. Dashboard

### 7.1 Data Dashboard

**Endpoint:** `GET /api/dashboard`

**Middleware:** verifyToken + verifyAdmin

**Proses:**

```
1. Hitung total ruangan aktif
2. Hitung booking hari ini (tanggal = today):
   a. Total booking hari ini
   b. Jumlah Approved (hari ini)
   c. Jumlah Pending (hari ini)
   d. Jumlah Rejected (hari ini)
3. Hitung total booking Pending (keseluruhan, termasuk yang bukan hari ini)
4. Hitung total booking Approved (hari ini)
5. Return aggregated data
```

**Output:**

```json
{
  "status": "success",
  "data": {
    "totalRuangan": 5,
    "totalRuanganAktif": 4,
    "bookingHariIni": {
      "total": 8,
      "pending": 3,
      "approved": 4,
      "rejected": 1
    },
    "bookingPending": 7,
    "tanggal": "2026-06-22"
  }
}
```

### 7.2 Tampilan Dashboard

```
┌─────────────────────────────────────┐
│  HIMA Space — Dashboard             │
├─────────┬─────────┬─────────┬────────┤
│ Ruangan │ Booking │ Pending │ Sudah  │
│ Aktif   │ Hari Ini│         │ Disetujui│
│   4     │    8    │   3     │    4   │
├─────────┴─────────┴─────────┴────────┤
│                                       │
│  Booking Pending Perlu Ditindaklanjuti │
│  ┌─────┬────────┬────────┬────────┐   │
│  │ #   │ Judul  │ Ruangan│ Waktu  │   │
│  ├─────┼────────┼────────┼────────┤   │
│  │ 1   │ Rapat  │ HIMA   │ 13:00  │   │
│  │ 2   │ Seminar│ Aula   │ 09:00  │   │
│  └─────┴────────┴────────┴────────┘   │
└─────────────────────────────────────┘
```

**Keterangan tambahan:**
- Kartu statistik (card) dengan warna berbeda per kategori
- Daftar "booking pending yang perlu di-review" — 5 teratas
- Link cepat ke halaman approval / kelola booking

---

## 8. Error Handling & Response Format

### 8.1 Standard Response

**Success:**
```json
{
  "status": "success",
  "data": { ... },
  "pagination": { ... }  // jika ada
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Deskripsi error yang readable",
  "errors": []  // detail validasi field, opsional
}
```

### 8.2 Kode Error

| HTTP | Kondisi |
|------|---------|
| 400 | Bad request (JSON parse error, dll) |
| 401 | Belum login / token invalid / token expired |
| 403 | Role tidak punya akses |
| 404 | Resource tidak ditemukan |
| 422 | Validasi gagal / business rule violated |
| 500 | Internal server error |

### 8.3 Global Error Handler

```
1. Setiap error yang terdeteksi di catch block:
   - Log error ke console (development) atau file (production)
   - Return response JSON sesuai format standar
2. Jangan expose stack trace di production
```

---

## 9. State Transition Diagram — Booking

```
     ┌──────────┐
     │  Pending │◄────── Buat Booking
     └────┬─────┘
          │
     ┌────┴─────┐           ┌────────────┐
     │          ├──────────►│  Rejected  │
     │  Cek     │  Reject   └────────────┘
     │  Admin   │
     │          ├──────────►┌────────────┐
     └──────────┘  Approve  │  Approved  │
                            └──────┬─────┘
                                   │
                              ┌────┴─────┐
                              │ Cancelled│
                              └──────────┘
                          (User Cancel / Admin Cancel)
```

**Transitions yang diizinkan:**

| Dari | Ke | Siapa | Syarat |
|------|----|-------|--------|
| — | Pending | Mahasiswa atau Admin | Validasi konflik lolos |
| Pending | Approved | Admin | — |
| Pending | Rejected | Admin | — |
| Pending | Cancelled | Pemilik atau Admin | — |
| Approved | Cancelled | Pemilik atau Admin | — |
| Rejected | — | — | Terminal state |
| Cancelled | — | — | Terminal state |

**Transitions yang TIDAK diizinkan:**

| Dari | Ke | Alasan |
|------|----|--------|
| Rejected | Approved | Booking yang ditolak tidak bisa diapprove ulang |
| Cancelled | Approved | Booking yang dibatalkan tidak bisa diaktifkan lagi |
| Approved | Pending | Tidak bisa mundur |
| Approved | Rejected | Jika sudah approved dan ternyata salah, admin harus cancel saja |

---

## 10. Use Cases Detail

### UC-01: Mahasiswa Booking Ruangan

| Item | Detail |
|------|--------|
| **Actor** | Mahasiswa (terautentikasi) |
| **Pre-condition** | Mahasiswa sudah login, ruangan tersedia |
| **Post-condition** | Booking tersimpan dengan status Pending |

**Normal Flow:**

```
1. Mahasiswa membuka halaman kalender
2. Sistem menampilkan kalender dengan jadwal ruangan
3. Mahasiswa memilih slot waktu kosong (klik + drag)
4. Sistem membuka form booking (tanggal & jam terisi otomatis)
5. Mahasiswa mengisi judul kegiatan
6. Mahasiswa klik "Booking"
7. Sistem validasi konflik:
   a. [Tidak ada konflik] → Simpan booking, status Pending → step 8
   b. [Ada konflik] → Tampilkan error + daftar booking bentrok → kembali ke step 5
8. Sistem redirect ke halaman kalender
9. Booking tampil di kalender dengan warna kuning (Pending)
```

**Alternative Flow — Booking Dari Halaman Manual:**

```
3a. Mahasiswa buka halaman "Buat Booking"
4a. Mahasiswa isi manual: ruangan, tanggal, jamMulai, jamSelesai, judul
5a. Lanjut ke step 6 Normal Flow
```

### UC-02: Admin Approve Booking

| Item | Detail |
|------|--------|
| **Actor** | Admin (terautentikasi) |
| **Pre-condition** | Ada booking dengan status Pending |
| **Post-condition** | Booking berstatus Approved |

**Normal Flow:**

```
1. Admin buka dashboard → lihat card "Booking Pending: 3"
2. Admin klik "Lihat Detail" atau masuk ke halaman approval
3. Sistem menampilkan daftar booking Pending (urutan: terlama duluan)
4. Admin klik salah satu → lihat detail
5. Admin klik "Approve"
6. Sistem validasi konflik ulang:
   a. [Aman] → Update status = Approved → step 7
   b. [Bentrok] → Tampilkan error "Booking ini sudah bentrok..." → step 4
7. Sistem menampilkan sukses
8. Booking tampil di kalender dengan warna hijau (Approved)
```

### UC-03: Admin Reject Booking

| Item | Detail |
|------|--------|
| **Actor** | Admin (terautentikasi) |
| **Pre-condition** | Ada booking dengan status Pending |
| **Post-condition** | Booking berstatus Rejected |

**Normal Flow:**

```
1-4. Sama dengan UC-02 step 1-4
5. Admin klik "Reject"
6. Sistem menampilkan form "Alasan penolakan" (opsional)
7. Admin isi alasan (tidak wajib) → klik "Reject"
8. Update status = Rejected, simpan alasan
9. Sistem menampilkan sukses
```

### UC-04: Mahasiswa Batalkan Booking

| Item | Detail |
|------|--------|
| **Actor** | Mahasiswa (terautentikasi) |
| **Pre-condition** | Ada booking milik user dengan status Pending atau Approved |
| **Post-condition** | Booking berstatus Cancelled |

**Normal Flow:**

```
1. Mahasiswa buka halaman histori booking
2. Sistem menampilkan daftar booking miliknya
3. Mahasiswa klik salah satu booking
4. Sistem menampilkan detail booking
5. Mahasiswa klik "Batalkan Booking"
6. Sistem konfirmasi: "Apakah kamu yakin ingin membatalkan booking ini?"
7. Mahasiswa klik "Ya, Batalkan"
8. Update status = Cancelled
9. Sistem menampilkan sukses
```

---

## 11. Matrix Akses

### 11.1 Feature Access by Role

| Fitur | Admin | Mahasiswa | Tanpa Login |
|-------|-------|-----------|-------------|
| Login | ✅ | ✅ | ❌ (halaman login) |
| Lihat Kalender | ✅ | ✅ | ❌ |
| Booking Ruangan | ✅ | ✅ | ❌ |
| Histori Sendiri | ✅ | ✅ | ❌ |
| Histori Semua | ✅ | ❌ | ❌ |
| CRUD Ruangan | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| Dashboard | ✅ | ❌ | ❌ |
| Cancel Booking Sendiri | ✅ | ✅ | ❌ |
| Cancel Booking Orang | ✅ | ❌ | ❌ |

### 11.2 API Access by Role

| Endpoint | Method | Admin | Mahasiswa |
|----------|--------|-------|-----------|
| `/api/auth/login` | POST | ✅ | ✅ |
| `/api/auth/logout` | POST | ✅ | ✅ |
| `/api/ruangan` | GET | ✅ | ✅ |
| `/api/ruangan` | POST | ✅ | ❌ |
| `/api/ruangan/:id` | GET | ✅ | ✅ |
| `/api/ruangan/:id` | PUT | ✅ | ❌ |
| `/api/ruangan/:id` | DELETE | ✅ | ❌ |
| `/api/booking` | GET | ✅ (semua) | ✅ (milik sendiri) |
| `/api/booking` | POST | ✅ | ✅ |
| `/api/booking/:id` | GET | ✅ (semua) | ✅ (milik sendiri) |
| `/api/booking/:id/approve` | PATCH | ✅ | ❌ |
| `/api/booking/:id/reject` | PATCH | ✅ | ❌ |
| `/api/booking/:id/cancel` | PATCH | ✅ (semua) | ✅ (milik sendiri) |
| `/api/booking/pending` | GET | ✅ | ❌ |
| `/api/kalender` | GET | ✅ | ✅ |
| `/api/dashboard` | GET | ✅ | ❌ |

---

## 12. Validasi Rules — Ringkasan

### 12.1 Validasi Ruangan

| Field | Aturan |
|-------|--------|
| nama | Wajib, 1-100 karakter, unik (case-insensitive) |
| kapasitas | Wajib, integer >= 1 |
| fasilitas | Opsional, array of string |
| deskripsi | Opsional, max 500 karakter |

### 12.2 Validasi Booking

| Field | Aturan |
|-------|--------|
| judul | Wajib, 3-200 karakter, trimmed |
| deskripsi | Opsional, max 500 karakter |
| ruanganId | Wajib, harus ID ruangan yang valid & aktif |
| tanggal | Wajib, format YYYY-MM-DD, tidak boleh <= hari kemarin |
| jamMulai | Wajib, format HH:mm (24h), range 00:00-23:59 |
| jamSelesai | Wajib, format HH:mm (24h), harus > jamMulai |
| Konflik | Status Approved pada ruangan & tanggal yang sama tidak boleh overlap |

### 12.3 Validasi Auth

| Field | Aturan |
|-------|--------|
| email | Wajib, format email valid |
| password | Wajib, min 6 karakter |

---

## 13. Glossary FSD

| Istilah | Definisi |
|---------|----------|
| **Middleware** | Fungsi yang dijalankan sebelum handler route untuk cek auth/role |
| **JWT** | JSON Web Token — token autentikasi stateless |
| **FullCalendar** | Library JavaScript untuk rendering kalender interaktif |
| **Event Object** | Format data yang dipahami FullCalendar.js (title, start, end, color) |
| **Aggregation** | Penghitungan total/statistik dari data yang ada |
| **Pagination** | Pembagian data menjadi halaman-halaman |
| **Terminal State** | Status yang tidak bisa berubah lagi (Rejected, Cancelled) |
| **Partial Update** | Update hanya field yang dikirimkan, tidak perlu semua field |

---

*Dokumen ini bersifat teknis dan menjadi acuan implementasi. Perubahan pada logika bisnis harus diikuti dengan update dokumen ini.*
