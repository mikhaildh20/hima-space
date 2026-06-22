# ERD — HIMA Space

> **Entity Relationship Diagram**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Database: PostgreSQL
> Acuan: TRD v1.0

---

## 1. Ringkasan Database

HIMA Space menggunakan **PostgreSQL** sebagai database relasional. Struktur database terdiri dari **3 tabel utama**:

| # | Tabel | Kegunaan | Record Estimasi |
|---|-------|----------|-----------------|
| 1 | `users` | Data pengguna (admin & mahasiswa) | 10-100 |
| 2 | `ruangan` | Data ruangan yang bisa dibooking | 5-20 |
| 3 | `bookings` | Data booking/permohonan ruangan | 100-1000/tahun |

**Total tabel:** 3
**Estimasi ukuran database:** < 50MB untuk 1 tahun operasional

---

## 2. Diagram Visual

### 2.1 Entity Relationship Diagram (Crow's Foot Notation)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIP DIAGRAM                           │
│                                    HIMA Space                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────────┐
                           │       USERS         │
                           │─────────────────────│
                           │ PK id          INT  │
                           │    nama        VARCHAR(100) │
                           │ UQ email       VARCHAR(255) │
                           │    password    VARCHAR(60)  │
                           │    role        ENUM         │
                           │    createdAt   TIMESTAMP    │
                           │    updatedAt   TIMESTAMP    │
                           └──────────┬──────────┘
                                      │
                                      │ 1
                                      │
                                      │
                                      ∞ (banyak)
                           ┌──────────┴──────────────────────────────────────┐
                           │              BOOKINGS                          │
                           │────────────────────────────────────────────────│
                           │ PK id              INT                         │
                           │    judul           VARCHAR(200)                │
                           │    deskripsi       TEXT (nullable)             │
                           │ FK ruanganId       INT ──────────────────┐    │
                           │ FK userId          INT ──────────┐       │    │
                           │    tanggal         DATE          │       │    │
                           │    jamMulai        VARCHAR(5)    │       │    │
                           │    jamSelesai      VARCHAR(5)    │       │    │
                           │    status          ENUM          │       │    │
                           │    rejectReason    TEXT (nullable)│      │    │
                           │    createdAt       TIMESTAMP     │       │    │
                           │    updatedAt       TIMESTAMP     │       │    │
                           └─────────────────────┼────────────┼───────┘    │
                                                 │            │            │
                                                 │ N          │ N          │
                                                 │            │            │
                                                 ∞            ∞            │
                           ┌─────────────────────┴────────────┘            │
                           │                                               │
                           │ 1                                             │ 1
                           │                                               │
                    ┌──────┴──────────┐                        ┌───────────┴────────┐
                    │    RUANGAN      │                        │    USERS (again)   │
                    │─────────────────│                        │────────────────────│
                    │ PK id      INT  │                        │                    │
                    │ UQ nama    VARCHAR(100)                  │                    │
                    │    kapasitas INT │                        │                    │
                    │    fasilitas VARCHAR(500)                │                    │
                    │    deskripsi TEXT (nullable)             │                    │
                    │    aktif    BOOLEAN │                    │                    │
                    │    createdAt TIMESTAMP │                 │                    │
                    │    updatedAt TIMESTAMP │                 │                    │
                    └─────────────────┘                        └────────────────────┘


LEGEND:
  PK = Primary Key
  FK = Foreign Key
  UQ = Unique Constraint
  INT = Integer
  VARCHAR(n) = Variable Character with max n length
  TEXT = Variable length text
  DATE = Date only (YYYY-MM-DD)
  TIMESTAMP = Date and time
  BOOLEAN = True/False
  ENUM = Enumeration (fixed values)
  1 ── ∞ = One-to-Many relationship
```

---

### 2.2 Relationship Matrix

| Parent Table | Child Table | Relationship | Foreign Key | On Delete |
|--------------|-------------|--------------|-------------|-----------|
| `users` | `bookings` | 1 : N | `bookings.userId` → `users.id` | CASCADE |
| `ruangan` | `bookings` | 1 : N | `bookings.ruanganId` → `ruangan.id` | CASCADE |

**Penjelasan:**
- **1 user** bisa memiliki **banyak booking** (1:N)
- **1 ruangan** bisa memiliki **banyak booking** (1:N)
- **1 booking** dimiliki oleh **1 user** dan **1 ruangan** (N:1 ke masing-masing)
- Tidak ada relasi many-to-many dalam scope MVP

---

## 3. Detail Tabel

### 3.1 Tabel: `users`

**Kegunaan:** Menyimpan data pengguna sistem (admin dan mahasiswa)

```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(60) NOT NULL,  -- bcrypt hashed
    role        VARCHAR(20) NOT NULL DEFAULT 'mahasiswa',
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX users_email_idx ON users(email);
```

**Field Detail:**

| Field | Tipe Data | Nullable | Default | Constraint | Keterangan |
|-------|-----------|----------|---------|------------|------------|
| `id` | SERIAL (INTEGER) | No | auto-increment | PRIMARY KEY | ID unik user |
| `nama` | VARCHAR(100) | No | — | — | Nama lengkap |
| `email` | VARCHAR(255) | No | — | UNIQUE | Email (login credential) |
| `password` | VARCHAR(60) | No | — | — | Password bcrypt hash (60 chars) |
| `role` | VARCHAR(20) | No | 'mahasiswa' | CHECK IN ('admin', 'mahasiswa') | Role user |
| `createdAt` | TIMESTAMP | No | NOW() | — | Waktu pembuatan record |
| `updatedAt` | TIMESTAMP | No | NOW() | — | Waktu update terakhir |

**Example Data:**

| id | nama | email | password | role | createdAt |
|----|------|-------|----------|------|-----------|
| 1 | Admin HIMA | admin@hima.id | $2b$10$... (hashed) | admin | 2026-06-01 00:00:00 |
| 2 | Budi Santoso | budi@example.com | $2b$10$... (hashed) | mahasiswa | 2026-06-01 00:00:00 |
| 3 | Sari Dewi | sari@example.com | $2b$10$... (hashed) | mahasiswa | 2026-06-01 00:00:00 |

---

### 3.2 Tabel: `ruangan`

**Kegunaan:** Menyimpan data ruangan yang bisa dibooking

```sql
CREATE TABLE ruangan (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL UNIQUE,
    kapasitas   INTEGER NOT NULL CHECK (kapasitas >= 1),
    fasilitas   VARCHAR(500) NOT NULL DEFAULT '[]',  -- JSON array
    deskripsi   TEXT,
    aktif       BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX ruangan_aktif_idx ON ruangan(aktif);
CREATE INDEX ruangan_nama_idx ON ruangan(nama);
```

**Field Detail:**

| Field | Tipe Data | Nullable | Default | Constraint | Keterangan |
|-------|-----------|----------|---------|------------|------------|
| `id` | SERIAL (INTEGER) | No | auto-increment | PRIMARY KEY | ID unik ruangan |
| `nama` | VARCHAR(100) | No | — | UNIQUE | Nama ruangan |
| `kapasitas` | INTEGER | No | — | CHECK (>= 1) | Kapasitas orang |
| `fasilitas` | VARCHAR(500) | No | '[]' | — | JSON array: ["AC","Proyektor"] |
| `deskripsi` | TEXT | Yes | NULL | — | Deskripsi ruangan |
| `aktif` | BOOLEAN | No | TRUE | — | Status aktif/nonaktif |
| `createdAt` | TIMESTAMP | No | NOW() | — | Waktu pembuatan record |
| `updatedAt` | TIMESTAMP | No | NOW() | — | Waktu update terakhir |

**Contoh Data `fasilitas` (JSON Array):**

```json
["AC", "Proyektor", "Whiteboard"]
```

**Example Data:**

| id | nama | kapasitas | fasilitas | deskripsi | aktif |
|----|------|-----------|-----------|-----------|-------|
| 1 | Ruang HIMA | 30 | ["AC","Proyektor","Whiteboard"] | Ruang utama himpunan | TRUE |
| 2 | Aula Serbaguna | 100 | ["AC","Sound System","Panggung"] | Aula untuk acara besar | TRUE |
| 3 | Ruang Rapat | 15 | ["AC","Whiteboard"] | Ruang rapat kecil | TRUE |
| 4 | Ruang Multimedia | 20 | ["AC","Proyektor","Speaker"] | Untuk presentasi & workshop | FALSE |

---

### 3.3 Tabel: `bookings`

**Kegunaan:** Menyimpan data booking/permohonan penggunaan ruangan

```sql
CREATE TABLE bookings (
    id            SERIAL PRIMARY KEY,
    judul         VARCHAR(200) NOT NULL,
    deskripsi     TEXT,
    ruanganId     INTEGER NOT NULL,
    userId        INTEGER NOT NULL,
    tanggal       DATE NOT NULL,
    jamMulai      VARCHAR(5) NOT NULL,  -- "HH:mm"
    jamSelesai    VARCHAR(5) NOT NULL,  -- "HH:mm"
    status        VARCHAR(20) NOT NULL DEFAULT 'Pending',
    rejectReason  TEXT,
    createdAt     TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_booking_ruangan
        FOREIGN KEY (ruanganId)
        REFERENCES ruangan(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_jam_selesai
        CHECK (jamSelesai > jamMulai),

    CONSTRAINT chk_status
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled'))
);

-- Indexes (Critical for performance)
CREATE INDEX bookings_ruangan_tanggal_status_idx
    ON bookings(ruanganId, tanggal, status);

CREATE INDEX bookings_user_status_idx
    ON bookings(userId, status);

CREATE INDEX bookings_status_idx
    ON bookings(status);

CREATE INDEX bookings_tanggal_idx
    ON bookings(tanggal);
```

**Field Detail:**

| Field | Tipe Data | Nullable | Default | Constraint | Keterangan |
|-------|-----------|----------|---------|------------|------------|
| `id` | SERIAL (INTEGER) | No | auto-increment | PRIMARY KEY | ID unik booking |
| `judul` | VARCHAR(200) | No | — | — | Judul kegiatan |
| `deskripsi` | TEXT | Yes | NULL | — | Deskripsi kegiatan |
| `ruanganId` | INTEGER | No | — | FK → ruangan.id | ID ruangan |
| `userId` | INTEGER | No | — | FK → users.id | ID user pemesan |
| `tanggal` | DATE | No | — | — | Tanggal booking (YYYY-MM-DD) |
| `jamMulai` | VARCHAR(5) | No | — | — | Jam mulai (HH:mm, 24h) |
| `jamSelesai` | VARCHAR(5) | No | — | — | Jam selesai (HH:mm, 24h) |
| `status` | VARCHAR(20) | No | 'Pending' | CHECK IN (...) | Status booking |
| `rejectReason` | TEXT | Yes | NULL | — | Alasan penolakan (admin) |
| `createdAt` | TIMESTAMP | No | NOW() | — | Waktu pembuatan record |
| `updatedAt` | TIMESTAMP | No | NOW() | — | Waktu update terakhir |

**Status ENUM Values:**

| Value | Keterangan | Terminal? |
|-------|------------|-----------|
| `Pending` | Menunggu approval admin | No |
| `Approved` | Disetujui admin | No (bisa cancelled) |
| `Rejected` | Ditolak admin | Ya (tidak bisa diubah) |
| `Cancelled` | Dibatalkan user/admin | Ya (tidak bisa diubah) |

**Example Data:**

| id | judul | ruanganId | userId | tanggal | jamMulai | jamSelesai | status |
|----|-------|-----------|--------|----------|----------|------------|--------|
| 1 | Rapat Pengurus | 1 | 2 | 2026-06-25 | 13:00 | 15:00 | Approved |
| 2 | Seminar Akademik | 2 | 3 | 2026-06-25 | 09:00 | 12:00 | Approved |
| 3 | Workshop Python | 1 | 2 | 2026-06-26 | 14:00 | 16:00 | Pending |
| 4 | Presentasi Tugas | 3 | 3 | 2026-06-24 | 10:00 | 12:00 | Rejected |
| 5 | Bimbingan Skripsi | 3 | 2 | 2026-06-23 | 09:00 | 11:00 | Cancelled |

---

## 4. Relasi Detail

### 4.1 One-to-Many: Users → Bookings

```
┌─────────────────┐         ┌─────────────────┐
│      USERS      │         │    BOOKINGS     │
├─────────────────┤    1:N  ├─────────────────┤
│ PK id           │─────────│ FK userId       │
│    nama         │         │    judul        │
│    email        │         │    tanggal      │
│    ...          │         │    ...          │
└─────────────────┘         └─────────────────┘

Contoh:
  User Budi (id=2) memiliki 3 booking:
    - Booking #1 (Rapat Pengurus)
    - Booking #3 (Workshop Python)
    - Booking #5 (Bimbingan Skripsi - Cancelled)
```

**Implementasi Query:**

```typescript
// Get user with all bookings
const userWithBookings = await prisma.user.findUnique({
  where: { id: 2 },
  include: {
    bookings: {
      orderBy: { tanggal: 'desc' }
    }
  }
});

// Result:
// {
//   id: 2,
//   nama: "Budi Santoso",
//   bookings: [
//     { id: 5, judul: "Bimbingan Skripsi", status: "Cancelled" },
//     { id: 3, judul: "Workshop Python", status: "Pending" },
//     { id: 1, judul: "Rapat Pengurus", status: "Approved" }
//   ]
// }
```

---

### 4.2 One-to-Many: Ruangan → Bookings

```
┌─────────────────┐         ┌─────────────────┐
│     RUANGAN     │         │    BOOKINGS     │
├─────────────────┤    1:N  ├─────────────────┤
│ PK id           │─────────│ FK ruanganId    │
│    nama         │         │    judul        │
│    kapasitas    │         │    tanggal      │
│    ...          │         │    ...          │
└─────────────────┘         └─────────────────┘

Contoh:
  Ruang HIMA (id=1) memiliki 2 booking:
    - Booking #1 (Rapat Pengurus - Approved)
    - Booking #3 (Workshop Python - Pending)
```

**Implementasi Query:**

```typescript
// Get room with all bookings
const ruanganWithBookings = await prisma.ruangan.findUnique({
  where: { id: 1 },
  include: {
    bookings: {
      where: { status: 'Approved' },  // Only active bookings
      orderBy: { tanggal: 'asc' }
    }
  }
});

// Result:
// {
//   id: 1,
//   nama: "Ruang HIMA",
//   bookings: [
//     { id: 1, judul: "Rapat Pengurus", tanggal: "2026-06-25", status: "Approved" }
//   ]
// }
```

---

### 4.3 Conflict Detection Query

**Relasi kritis untuk deteksi konflik booking:**

```
Booking A (existing):                Booking B (baru):
┌─────────────────────┐              ┌─────────────────────┐
│ ruanganId: 1        │              │ ruanganId: 1        │ ← Same room
│ tanggal: 2026-06-25 │              │ tanggal: 2026-06-25 │ ← Same date
│ jamMulai: "13:00"   │              │ jamMulai: "14:00"   │ ← Overlap!
│ jamSelesai: "15:00"  │              │ jamSelesai: "16:00"  │
│ status: "Approved"  │              │ status: "Pending"   │
└─────────────────────┘              └─────────────────────┘

Conflict Condition:
  A.jamMulai < B.jamSelesai   →  "13:00" < "16:00"  ✓
  AND
  A.jamSelesai > B.jamMulai   →  "15:00" > "14:00"  ✓
  AND
  A.ruanganId = B.ruanganId   →  1 = 1              ✓
  AND
  A.tanggal = B.tanggal       →  same date           ✓
  AND
  A.status = "Approved"       →  Approved             ✓
  
  = CONFLICT!
```

**SQL Query:**

```sql
SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE ruanganId = 1                        -- Same room
      AND tanggal = '2026-06-25'::date         -- Same date
      AND status = 'Approved'                   -- Only active bookings
      AND jamMulai < '16:00'                    -- existing.start < new.end
      AND jamSelesai > '14:00'                  -- existing.end > new.start
) AS has_conflict;
```

**Prisma Query:**

```typescript
const hasConflict = await prisma.booking.findFirst({
  where: {
    ruanganId: 1,
    tanggal: new Date('2026-06-25'),
    status: 'Approved',
    jamMulai: { lt: '16:00' },    // existing.start < new.end
    jamSelesai: { gt: '14:00' }   // existing.end > new.start
  }
});

// If hasConflict !== null → CONFLICT
```

---

## 5. Index Documentation

### 5.1 Index List

| Table | Index Name | Columns | Type | Purpose |
|-------|------------|---------|------|---------|
| users | `users_email_idx` | email | UNIQUE | Login lookup (fast) |
| ruangan | `ruangan_aktif_idx` | aktif | BTREE | Filter active rooms |
| ruangan | `ruangan_nama_idx` | nama | BTREE | Search by name |
| bookings | `bookings_ruangan_tanggal_status_idx` | ruanganId, tanggal, status | BTREE | **Conflict detection** |
| bookings | `bookings_user_status_idx` | userId, status | BTREE | User booking history |
| bookings | `bookings_status_idx` | status | BTREE | Pending queue filter |
| bookings | `bookings_tanggal_idx` | tanggal | BTREE | Dashboard date filter |

### 5.2 Index Explanation

**Critical Index: `bookings_ruangan_tanggal_status_idx`**

```
Index columns: (ruanganId, tanggal, status)

Query yang menggunakan index ini:
- Conflict detection: WHERE ruanganId = ? AND tanggal = ? AND status = 'Approved'
- Calendar filter: WHERE ruanganId = ? AND tanggal BETWEEN ? AND ? AND status IN ('Approved','Pending')

Tanpa index:
- Full table scan setiap kali cek konflik
- Lambat jika bookings > 1000 records

Dengan index:
- Direct lookup ke kombinasi ruangan+ tanggal+ status
- Sangat cepat meskipun 100.000+ records
```

---

## 6. Constraint Documentation

### 6.1 Primary Key Constraints

| Table | Column | Type | Auto-increment |
|-------|--------|------|----------------|
| users | id | SERIAL | Yes |
| ruangan | id | SERIAL | Yes |
| bookings | id | SERIAL | Yes |

### 6.2 Unique Constraints

| Table | Column | Keterangan |
|-------|--------|------------|
| users | email | Tidak boleh ada 2 user dengan email sama |
| ruangan | nama | Tidak boleh ada 2 ruangan dengan nama sama |

### 6.3 Foreign Key Constraints

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|-----------|
| bookings | ruanganId | ruangan(id) | CASCADE | CASCADE |
| bookings | userId | users(id) | CASCADE | CASCADE |

**Penjelasan CASCADE:**
- `ON DELETE CASCADE`: Jika user/ruangan dihapus, semua booking terkait ikut terhapus
- `ON UPDATE CASCADE`: Jika id user/ruangan berubah (jarang terjadi), update otomatis di bookings

### 6.4 Check Constraints

| Table | Constraint | Rule | Keterangan |
|-------|------------|------|------------|
| ruangan | `chk_ruangan_kapasitas` | kapasitas >= 1 | Kapasitas minimal 1 orang |
| bookings | `chk_jam_selesai` | jamSelesai > jamMulai | Jam selesai harus setelah jam mulai |
| bookings | `chk_status` | status IN (...) | Hanya boleh nilai status yang valid |

### 6.5 Default Values

| Table | Column | Default | Keterangan |
|-------|--------|---------|------------|
| users | role | 'mahasiswa' | Default role adalah mahasiswa |
| ruangan | fasilitas | '[]' | Default kosong (JSON array kosong) |
| ruangan | aktif | TRUE | Default ruangan aktif |
| bookings | status | 'Pending' | Default status Pending |

---

## 7. Data Types Reference

### 7.1 PostgreSQL Data Types Used

| Type | PostgreSQL | Contoh | Kegunaan |
|------|------------|--------|----------|
| Integer | SERIAL / INTEGER | 1, 2, 100 | ID, kapasitas |
| String | VARCHAR(n) | "Ruang HIMA" | Nama, email, judul |
| Text | TEXT | "Deskripsi panjang..." | Deskripsi, catatan |
| Date | DATE | 2026-06-25 | Tanggal booking |
| Timestamp | TIMESTAMP | 2026-06-25 10:00:00 | createdAt, updatedAt |
| Boolean | BOOLEAN | TRUE / FALSE | Status aktif |
| Enum | VARCHAR + CHECK | 'Pending' | Status booking, role |

### 7.2 Field Size Calculation

**Per Record Estimasi:**

| Table | Field Size | Total/Record |
|-------|------------|--------------|
| users | ~200 bytes | 200 bytes |
| ruangan | ~250 bytes | 250 bytes |
| bookings | ~350 bytes | 350 bytes |

**Total Estimasi:**

| Table | Records/Tahun | Size/Tahun |
|-------|---------------|------------|
| users | 50 | 10 KB |
| ruangan | 10 | 2.5 KB |
| bookings | 500 | 175 KB |
| **Total** | — | **~200 KB/tahun** |

> Database sangat kecil, tidak perlu optimization berat.

---

## 8. Migration SQL

### 8.1 Initial Migration

```sql
-- Migration: init
-- Date: 2026-06-22
-- Description: Initial schema

-- ============================================
-- CREATE ENUMS
-- ============================================

-- (Handled by Prisma via VARCHAR + CHECK)

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(60) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'mahasiswa',
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ruangan table
CREATE TABLE ruangan (
    id          SERIAL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL UNIQUE,
    kapasitas   INTEGER NOT NULL CHECK (kapasitas >= 1),
    fasilitas   VARCHAR(500) NOT NULL DEFAULT '[]',
    deskripsi   TEXT,
    aktif       BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id            SERIAL PRIMARY KEY,
    judul         VARCHAR(200) NOT NULL,
    deskripsi     TEXT,
    ruanganId     INTEGER NOT NULL,
    userId        INTEGER NOT NULL,
    tanggal       DATE NOT NULL,
    jamMulai      VARCHAR(5) NOT NULL,
    jamSelesai    VARCHAR(5) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'Pending',
    rejectReason  TEXT,
    createdAt     TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt     TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_booking_ruangan
        FOREIGN KEY (ruanganId)
        REFERENCES ruangan(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_jam_selesai
        CHECK (jamSelesai > jamMulai),

    CONSTRAINT chk_status
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled'))
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Users
CREATE UNIQUE INDEX users_email_idx ON users(email);

-- Ruangan
CREATE INDEX ruangan_aktif_idx ON ruangan(aktif);
CREATE INDEX ruangan_nama_idx ON ruangan(nama);

-- Bookings (Critical indexes)
CREATE INDEX bookings_ruangan_tanggal_status_idx
    ON bookings(ruanganId, tanggal, status);

CREATE INDEX bookings_user_status_idx
    ON bookings(userId, status);

CREATE INDEX bookings_status_idx
    ON bookings(status);

CREATE INDEX bookings_tanggal_idx
    ON bookings(tanggal);

-- ============================================
-- SEED DATA
-- ============================================

-- Default admin user (password: admin123)
INSERT INTO users (nama, email, password, role) VALUES
('Admin HIMA', 'admin@hima.id', '$2b$10$...hashed...', 'admin');

-- Sample rooms
INSERT INTO ruangan (nama, kapasitas, fasilitas, deskripsi) VALUES
('Ruang HIMA', 30, '["AC","Proyektor","Whiteboard"]', 'Ruang utama himpunan'),
('Aula Serbaguna', 100, '["AC","Sound System","Panggung"]', 'Aula untuk acara besar'),
('Ruang Rapat', 15, '["AC","Whiteboard"]', 'Ruang rapat kecil');

-- ============================================
-- TRIGGER: Auto-update updatedAt
-- ============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ruangan_timestamp
    BEFORE UPDATE ON ruangan
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

---

## 9. Query Patterns

### 9.1 Common Queries

**1. Get all active rooms:**
```sql
SELECT * FROM ruangan WHERE aktif = TRUE ORDER BY nama;
```

**2. Get user's bookings:**
```sql
SELECT b.*, r.nama as ruangan_nama
FROM bookings b
JOIN ruangan r ON b.ruanganId = r.id
WHERE b.userId = ?
ORDER BY b.tanggal DESC, b.jamMulai DESC;
```

**3. Check conflict (critical):**
```sql
SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE ruanganId = ?
      AND tanggal = ?
      AND status = 'Approved'
      AND jamMulai < ?
      AND jamSelesai > ?
) AS has_conflict;
```

**4. Get pending bookings for admin:**
```sql
SELECT b.*, r.nama as ruangan_nama, u.nama as user_nama
FROM bookings b
JOIN ruangan r ON b.ruanganId = r.id
JOIN users u ON b.userId = u.id
WHERE b.status = 'Pending'
ORDER BY b.tanggal ASC, b.jamMulai ASC;
```

**5. Dashboard statistics:**
```sql
-- Total active rooms
SELECT COUNT(*) FROM ruangan WHERE aktif = TRUE;

-- Bookings today
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending,
    COUNT(*) FILTER (WHERE status = 'Approved') as approved,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected
FROM bookings
WHERE tanggal = CURRENT_DATE;

-- Total pending (all time)
SELECT COUNT(*) FROM bookings WHERE status = 'Pending';
```

---

## 10. Database Diagram — Compact View

```
┌────────────────────────────────────────────────────────────────────┐
│                        HIMA SPACE DATABASE                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    ┌──────────────┐                               ┌─────────────┐ │
│    │    USERS     │                               │   RUANGAN   │ │
│    │──────────────│                               │─────────────│ │
│    │ PK id        │                               │ PK id       │ │
│    │    nama      │                               │    nama     │ │
│    │ UQ email     │                               │    kapasitas│ │
│    │    password  │                               │    fasilitas│ │
│    │    role      │                               │    deskripsi│ │
│    └──────┬───────┘                               │    aktif    │ │
│           │                                       └──────┬──────┘ │
│           │ 1                                            │ 1      │
│           │                                              │        │
│           │         ┌────────────────────────────────────┘        │
│           │         │                                             │
│           │         │ N                                           │ N
│           │         ▼                                             │
│           │    ┌──────────────────────────────────────────────────┤
│           │    │                BOOKINGS                          │
│           └───►│─────────────────────────────────────────────────│
│                │ PK id                                           │
│                │    judul                                        │
│                │    deskripsi                                    │
│                │ FK ruanganId ──────────────────► ruangan.id     │
│                │ FK userId ─────────────────────► users.id       │
│                │    tanggal                                      │
│                │    jamMulai                                     │
│                │    jamSelesai                                   │
│                │    status                                       │
│                │    rejectReason                                 │
│                └─────────────────────────────────────────────────┘
│                                                                    │
│    RELATIONSHIPS:                                                  │
│      users 1 ──── N bookings                                      │
│      ruangan 1 ──── N bookings                                    │
│                                                                    │
│    TOTAL TABLES: 3                                                 │
│    TOTAL INDEXES: 7                                                │
│    TOTAL CONSTRAINTS: 6                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 11. Appendix: Database Commands

### 11.1 Prisma Commands

```bash
# Lihat schema
npx prisma schema preview

# Generate client
npx prisma generate

# Buat migration
npx prisma migrate dev --name <migration_name>

# Jalankan migration di production
npx prisma migrate deploy

# Push schema tanpa migration (development)
npx prisma db push

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Buka Prisma Studio (GUI)
npx prisma studio
```

### 11.2 Database Connection

```bash
# Connect via psql
psql postgresql://username:password@localhost:5432/hima_space

# Lihat tables
\dt

# Lihat table structure
\d users
\d ruangan
\d bookings

# Lihat indexes
\di

# Lihat constraints
SELECT conname, contype, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace;
```

---

*Dokumen ini menjelaskan struktur database HIMA Space secara detail. Untuk implementasi query, lihat TRD.md.*
