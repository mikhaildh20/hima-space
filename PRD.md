# PRD — HIMA Space

> **Product Requirements Document**
> Versi: 1.0
> Tanggal: 22 Juni 2026

---

## 1. Ringkasan Eksekutif

**HIMA Space** adalah aplikasi web untuk booking dan manajemen penggunaan ruangan organisasi mahasiswa. Aplikasi ini menyelesaikan permasalahan booking ruangan yang masih dilakukan secara manual melalui chat, yang menyebabkan jadwal bentrok, ketidakjelasan status ruangan, dan tidak adanya approval maupun histori penggunaan.

HIMA Space memberikan cara yang **terstruktur, transparan, dan mudah** untuk melihat ketersediaan ruangan, melakukan booking, serta mengelola approval — semua dalam satu tempat.

---

## 2. Masalah

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | Booking ruangan dilakukan lewat chat (WhatsApp, Telegram, dll.) | Pesan mudah tenggelam, tidak ada jejak yang rapi |
| 2 | Jadwal sering bentrok karena tidak ada pengecekan otomatis | Kegiatan terpaksa dibatalkan atau ruangan berebutan |
| 3 | Sulit mengetahui ruangan yang kosong pada waktu tertentu | User harus tanya satu per satu ke admin/bendahara |
| 4 | Tidak ada mekanisme approval | Siapapun bisa klaim ruangan tanpa konfirmasi |
| 5 | Tidak ada histori penggunaan ruangan | Sulit audit, tidak tahu siapa yang pakai kapan |

---

## 3. Solusi

HIMA Space menyediakan satu platform web yang memungkinkan:

- **Melihat jadwal ruangan secara visual** melalui kalender interaktif
- **Booking ruangan secara online** dengan pengecekan konflik otomatis
- **Approval oleh admin** sebelum booking dinyatakan aktif
- **Dashboard statistik** untuk overview penggunaan ruangan
- **Histori booking** yang bisa diakses oleh user dan admin

---

## 4. Target Pengguna

### 4.1 User Persona — Mahasiswa

| Atribut | Detail |
|---------|--------|
| **Nama** | Budi (representatif) |
| **Peran** | Anggota himpunan / organisasi kampus |
| **Kebutuhan** | Booking ruangan untuk rapat, seminar, atau kegiatan rutin |
| **Pain Point** | Harus chat admin, belum tentu di-respons cepat, sering bentrok jadwal |
| **Skill Tech** | Pengguna internet biasa, tidak perlu install apapun |

**Yang dilakukan Budi:**
1. Login ke HIMA Space
2. Lihat kalender untuk cek ruangan kosong
3. Isi form booking (judul kegiatan, tanggal, jam)
4. Tunggu approval admin
5. Cek status booking di dashboard

### 4.2 User Persona — Admin

| Atribut | Detail |
|---------|--------|
| **Nama** | Sari (representatif) |
| **Peran** | Ketua / Bendahara himpunan |
| **Kebutuhan** | Mengelola ruangan, men approve/reject booking, melihat statistik |
| **Pain Point** | Terlalu banyak chat masuk soal booking, sulit koordinasi |
| **Skill Tech** | Melek teknologi, bisa operate web app |

**Yang dilakukan Sari:**
1. Login ke HIMA Space
2. Kelola data ruangan (CRUD)
3. Review dan approve/reject booking dari mahasiswa
4. Lihat dashboard untuk overview hari ini

---

## 5. Fitur & Fungsionalitas

### 5.1 Autentikasi

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Login | Email + password, JWT token | Must Have |
| Role-based access | 2 role: Admin, Mahasiswa | Must Have |
| Logout | Hapus session/token | Must Have |

### 5.2 Manajemen Ruangan (Admin)

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Daftar Ruangan | Lihat semua ruangan beserta status | Must Have |
| Tambah Ruangan | Form: nama, kapasitas, fasilitas, deskripsi | Must Have |
| Edit Ruangan | Ubah data ruangan yang sudah ada | Must Have |
| Hapus/Nonaktifkan Ruangan | Set status aktif/nonaktif | Must Have |
| Detail Ruangan | Lihat detail lengkap suatu ruangan | Must Have |

**Field Ruangan:**
- Nama Ruangan (text, required)
- Kapasitas (number, required)
- Fasilitas (text/checkbox: AC, Proyektor, Whiteboard, dll.)
- Deskripsi (text, optional)
- Status (Aktif / Nonaktif)

### 5.3 Booking Ruangan

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Buat Booking | Form booking dengan pengecekan konflik | Must Have |
| Batalkan Booking | User batalkan booking sendiri (status Cancelled) | Must Have |
| Lihat Status Booking | Status: Pending, Approved, Rejected, Cancelled | Must Have |
| Histori Booking | Daftar semua booking user sendiri | Must Have |

**Field Booking:**
- Judul Kegiatan (text, required)
- Deskripsi (text, optional)
- Ruangan (dropdown, required)
- Tanggal (date, required)
- Jam Mulai (time, required)
- Jam Selesai (time, required)

**Status Booking:**
```
Pending → Approved
Pending → Rejected
Pending → Cancelled
```

### 5.4 Approval Booking (Admin)

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Daftar Booking Pending | Filter booking yang menunggu approval | Must Have |
| Approve | Ubah status ke Approved | Must Have |
| Reject | Ubah status ke Rejected + catatan (optional) | Must Have |

### 5.5 Kalender Booking

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Tampilan Kalender | Monthly/weekly view dengan FullCalendar.js | Must Have |
| Filter per Ruangan | Tampilkan jadwal untuk ruangan tertentu | Must Have |
| Info Booking | Klik event untuk lihat detail (judul, status, user) | Must Have |
| Indikator Ketersediaan | Warna beda untuk Pending, Approved, Rejected | Must Have |

### 5.6 Dashboard

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Total Ruangan | Jumlah ruangan aktif | Must Have |
| Booking Hari Ini | Jumlah booking untuk hari ini | Must Have |
| Booking Pending | Booking yang menunggu approval | Must Have |
| Booking Approved | Booking yang sudah disetujui (hari ini) | Must Have |
| Booking Rejected | Booking yang ditolak (hari ini) | Must Have |

---

## 6. Business Rules

| # | Rule | Implementasi |
|---|------|-------------|
| 1 | **Tidak boleh booking bentrok** | Sistem menolak booking baru yang waktunya overlap dengan booking status Approved pada ruangan yang sama |
| 2 | **Jam selesai > Jam mulai** | Validasi di form, jam selesai harus setelah jam mulai |
| 3 | **Rejected/Cancelled tidak bentrok** | Booking dengan status Rejected atau Cancelled tidak dihitung saat pengecekan konflik |
| 4 | **User hanya bisa ubah booking sendiri** | User non-admin tidak bisa edit/cancel booking milik orang lain |
| 5 | **Admin bisa ubah semua booking** | Admin memiliki akses penuh terhadap semua booking |

### Detail Business Rule #1 — Deteksi Konflik

```
Booking A (existing): Ruangan X, 13:00 – 15:00, Status: Approved
Booking B (baru):     Ruangan X, 14:00 – 16:00

Konflik terjadi karena:
  Booking B.jam_mulai < Booking A.jam_selesai
  DAN Booking B.jam_selesai > Booking A.jam_mulai
  DAN Ruangan sama
  DAN Booking A.status = Approved

→ Booking B DITOLAK (system error / notifikasi konflik)
```

---

## 7. User Flow

### 7.1 Alur Booking (Mahasiswa)

```
Login
  ↓
Lihat Kalender → Cek Ruangan Kosong
  ↓
Klik "Booking" pada ruangan & waktu yang tersedia
  ↓
Isi Form Booking (judul, deskripsi, tanggal, jam)
  ↓
Submit
  ↓
[Validasi Konflik]
  ├─ Konflik → Tampilkan error "Ruangan sudah dibooking pada waktu tersebut"
  └─ Tidak Konflik → Booking tersimpan dengan status "Pending"
        ↓
Tunggu Approval Admin
        ↓
[Admin Action]
  ├─ Approve → Status: Approved → User bisa lihat di kalender (hijau)
  └─ Reject → Status: Rejected → User bisa lihat di kalender (merah)
```

### 7.2 Alur Approval (Admin)

```
Login
  ↓
Dashboard → Lihat "Booking Pending"
  ↓
Klik Booking yang perlu di-review
  ↓
Lihat Detail (judul, ruangan, waktu, nama pemesan)
  ↓
[Keputusan]
  ├─ Approve → Status: Approved
  └─ Reject → Status: Rejected
```

---

## 8. Kriteria Keberhasilan

### 8.1 Success Metrics

| Metric | Target | Cara Ukur |
|--------|--------|-----------|
| Booking tanpa bentrok | 100% | Tidak ada 2 booking Approved yang overlap pada ruangan yang sama |
| Waktu booking < chat | < 2 menit | User bisa booking dari buka app sampai submit dalam < 2 menit |
| Admin bisa approve dalam 1 klik | Yes | Approval只需 1 klik, tidak perlu banyak langkah |
| Semua histori tercatat | 100% | Setiap booking (apapun statusnya) tercatat di sistem |

### 8.2 Acceptance Criteria

- [ ] User bisa login dan melihat role-nya (Admin/Mahasiswa)
- [ ] Admin bisa CRUD ruangan
- [ ] Mahasiswa bisa booking ruangan dengan pengecekan konflik otomatis
- [ ] Admin bisa approve/reject booking
- [ ] Kalender menampilkan jadwal booking secara visual
- [ ] Dashboard menampilkan statistik yang benar
- [ ] Tidak ada booking bentrok yang lolos
- [ ] User hanya bisa cancel booking milik sendiri
- [ ] Semua data tersimpan di PostgreSQL

---

## 9. Batasan (Constraints)

| # | Batasan | Alasan |
|---|---------|--------|
| 1 | Tidak ada payment/integrasi pembayaran | Scope MVP, tidak diperlukan |
| 2 | Tidak ada notifikasi email/Telegram | Bisa ditambahkan di versi mendatang |
| 3 | Tidak ada multi-tenant | Satu instalasi untuk satu organisasi |
| 4 | Tidak ada fitur recurring booking | MVP cukup booking per-event |
| 5 | Tidak ada mobile app | Web responsive sudah cukup |
| 6 | Tidak ada SSO/OAuth | JWT standalone cukup untuk skala organisasi |

---

## 10. Asumsi

| # | Asumsi |
|---|--------|
| 1 | User memiliki akses internet dan browser modern |
| 2 | Jumlah user tidak melebihi ratusan (skala himpunan/organisasi) |
| 3 | Admin sudah ditentukan sebelumnya (tidak ada self-registration) |
| 4 | Ruangan sudah diketahui dan tidak berubah-ubah |
| 5 | Jam operasional ruangan mengikuti jam kampus (08:00–22:00) |
| 6 | Satu user bisa memiliki max 1 booking per ruangan per waktu |

---

## 11. Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Backend | Next.js (App Router) | Fullstack JS, API routes built-in |
| ORM | Prisma | Type-safe, migration mudah, DX bagus |
| Database | PostgreSQL | Open source, stabil, relasional kuat |
| Frontend | Vanilla JS + Tailwind CSS | Ringan, cepat, tidak perlu build step kompleks |
| Kalender | FullCalendar.js | Mature, bagus untuk scheduling view |
| Auth | JWT (jsonwebtoken) | Stateless, ringan, cukup untuk 2 role |
| Hosting | VPS / Static | Deploy fleksibel |

---

## 12. Out of Scope (v1)

Fitur yang **tidak** termasuk dalam MVP ini:

- Recurring booking (booking rutin mingguan/bulanan)
- Notifikasi push / email / Telegram
- Multi-organisasi / multi-tenant
- Integrasi kalender eksternal (Google Calendar, Outlook)
- Export laporan ke PDF/Excel
- Rating/review ruangan
- Sistem antrian booking
- Self-registration user
- Dashboard analytics lanjutan (grafik, trend)

> Fitur-fitur ini bisa menjadi kandidat untuk **v2** berdasarkan feedback user.

---

## 13. Glossary

| Istilah | Definisi |
|---------|----------|
| **Booking** | Permohonan penggunaan ruangan pada waktu tertentu |
| **Approval** | Persetujuan admin terhadap booking |
| **Konflik** | Kondisi di mana dua atau lebih booking overlap pada ruangan yang sama |
| **Ruangan** | Fasilitas fisik yang bisa dibooking (gedung, aula, ruang rapat) |
| **Status** | Kondisi booking: Pending, Approved, Rejected, Cancelled |

---

*Dokumen ini bersifat hidup dan akan diperbarui seiring perkembangan project.*
