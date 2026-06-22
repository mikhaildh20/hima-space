# ROADMAP — HIMA Space

> **Product Development Roadmap**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: PRD v1.0, FSD v1.0, HLD v1.0, TRD v1.0

---

## 1. Visi & Tujuan Jangka Panjang

### 1.1 Visi

"Menjadi platform booking ruangan organisasi kampus terintegrasi dan mudah digunakan, memberdayakan himpunan, organisasi, dan kelompok belajar untuk mengoptimalkan penggunaan ruang melalui transparansi dan kolaborasi."

### 1.2 Misi

1. **Simplify Booking:** Ubah booking dari chat manual menjadi proses online yang sederhana dan intuitif
2. **Increase Visibility:** Berikan transparansi penuh ketersediaan ruangan melalui kalender interaktif
3. **Enable Control:** Berikan kontrol penuh atas ruangan dan approval ke admin yang tepat
4. **Maintain Maintain:** Pertahankan aplikasi yang ringan, mudah dipahami, dan dapat dikembangkan

### 1.3 Tujuan Utama

| Tujuan | Success Metric | Target |
|--------|----------------|--------|
| User Adoption | Persentase user aktif bulanan | >70% dari total 100 target organisasi |
| Booking Efficiency | Reduction in booking time | >90% dari waktu manual chat |
| Room Utilization | % ruangan yang digunakan | >60% dari 8 jam operasional |
| Admin Control | % booking yang diapprove/reject | >95% diapprove, <5% rejected |
| Technical Stability | Uptime | >99% (≈ 6 jam downtime per tahun) |

---

## 2. Timeline Pengembangan

### 2.1 Fase Pengembangan

| Fase | Periode | Tujuan | Target |
|------|--------|-------|--------|
| **MVP** | Q1 (Bulan 1-3) | Core functionality | Launch untuk 10 organisasi |
| **Beta** | Q2 (Bulan 4-6) | Stability & usability | 100 organisasi aktif |
| **Expansion** | Q3 (Bulan 7-9) | fitur tambahan & integrations | 500 organisasi aktif |
| **Enterprise** | Q4 (Bulan 10-12) | Scaling & additional features | 2.000+ organisasi aktif |

### 2.2 Quarter Breakdown

| Quarter | Bulan | Fokus Utama | Result (*Per Milestone*) |
|---------|-------|-------------|------------------------|
| **Q1 2026** | 1-3 | MVP Launcher | - 2 roles (Admin, Mahasiswa)
| | | | - CRUD Ruangan (Admin)
| | | | - Booking Ruangan (Mahasiswa)
| | | | - Kalender Booking
| | | | - Approval Proses
| | | | - Dashboard sederhana
| | | | **Launch v1.0 (Minimal Viable Product)** |
| **Q2 2026** | 4-6 | Beta Release | - Performance optimization
| | | | - Mobile responsive design
| | | | - User onboarding
| | | | - Bug fixes & stability
| | | | **Launch v2.0 (Beta)** |
| **Q3 2026** | 7-9 | Growth & Integrations | - Batch booking support
| | | | - Multi-organisasi support
| | | | - Email notifications
| | | | - Integration with university systems
| | | | **Launch v3.0 (Growth)** |
| **Q4 2026** | 10-12 | Enterprise & Scale | - API for external integrations
| | | | - Advanced analytics
| | | | - SMS notifications
| | | | - Enterprise security features
| | | | **Launch v4.0 (Enterprise)** |

### 2.3 Timeline Gambar

```
2026 ┌─────────────────────────────────────────────────────────────────┐
     │                                                                 ░░░░░░░ │
     │  Q1: MVP Phase (Bulan 1-3)  Q2: Beta Phase (Bulan 4-6)          │
     │  Q3: Expansion Phase (Bulan 7-9)  Q4: Enterprise Phase (Bulan 10-12)│
     │                                                                 ████  │
     └─────────────────────────────────────────────────────────────────┘
          Bulan 1   2   3   4   5   6   7   8   9   10  11  12
```

---

## 3. Fase MVP (Q1 2026)

### 3.1 Timeline & Milestones

| Bulan | Milestone | Delivered Features | Test Status |
|-------|-----------|-------------------|-------------|
| **1** | **Setup & Architecture** | - Tech stack setup
- Database schema
- CI/CD pipeline setup
| **2** | **Core Features** | - Autentikasi (JWT)
- CRUD Ruangan (Admin)
- Booking Ruangan (Mahasiswa)
| **3** | **Validation & Testing** | - Pengecekan konflik
- Form validation
- Page routing
| **3** | **Production Ready** | - Error handling
- Logging & monitoring
- Documentation |

### 3.2 Prioritas MVP

#### 3.2.1 Core User Stories

| # | User Story | Business Value | Dependencies |
|---|-------------|----------------|-------------|
| **US-1** | Sebagai mahasiswa, saya bisa login untuk mengakses kalender ruangan. | Akses masuk ke sistem. | Autentikasi selesai. |
| **US-2** | Sebagai admin, saya bisa mengelola data ruangan (lihat, tambah, edit, nonaktifkan). | Kontrol penuh atas data ruangan. | Autentikasi selesai. |
| **US-3** | Sebagai mahasiswa, saya bisa melihat kalender ruangan untuk mengetahui ketersediaan. | Transparansi ketersediaan. | Ruangan ada di database. |
| **US-4** | Sebagai mahasiswa, saya bisa membuat booking ruangan dengan pengecekan konflik otomatis. | Cegah double booking. | Feature US-2 (ruangan data). |
| **US-5** | Sebagai admin, saya bisa approve/reject booking dengan alasan opsional. | Kontrol atas quality control. | Feature US-4 (booking). |
| **US-6** | Sebagai admin, saya bisa melihat dashboard dengan statistik penggunaan ruangan. | Wawasan cepat ke penggunaan. | Semua fitur core. |

#### 3.2.2 Feature Breakdown

| Feature | Priority | Effort (SP) | Status | Owner |
|---------|----------|-------------|--------|-------|
| Autentikasi (JWT) | Must Have | 21 | ✅ Selesai | Backend |
| CRUD Ruangan | Must Have | 34 | ✅ Selesai | Backend |
| Booking Ruangan | Must Have | 42 | ✅ Selesai | Backend |
| Kalender Booking | Must Have | 28 | ✅ Selesai | Frontend |
| Approval Proses | Must Have | 21 | ✅ Selesai | Backend |
| Dashboard | Must Have | 14 | ✅ Selesai | Frontend |
| Form Validation | Must Have | 7 | ✅ Selesai | Frontend |
| Conflict Detection | Must Have | 13 | ✅ Selesai | Backend |

#### 3.2.3 Blockers & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Conflict detection bug | High | Pengujian menyeluruh |
| Authentication security issue | Critical | Use bcrypt, JWT dengan expiry | |
| Deploy failure | Medium | Rollback strategy, gray deployment |
| Database performance | Low | Optimized indexes |

### 3.3 Deliverables (MVP)

| Deliverable | Type | Audience | Acceptance Criteria |
|-------------|------|----------|-------------------|
| Dokumentasi PRD, FSD, HLD, TRD, ERD | Technical | Developer | Review lengkap |
| Source Code | Executable | DevOps | Build & test berhasil |
| Documentasi API | Technical | Developer | OpenAPI swagger |
| Deployed Instance | Production | User | Semua fitur core berfungsi |
| Test Coverage | Automated | QA | >80% code coverage |

---

## 4. Fase Beta (Q2 2026)

### 4.1 Prioritas Beta

#### 4.1.1 User Stories (Beta)

| # | User Story | Business Value | Dependencies |
|---|-------------|----------------|-------------|
| **US-7** | Sebagai mahasiswa, saya bisa batalkan booking sendiri (yang masih Pending/Approve). | Kontrol pengguna atas booking | Booking masih aktif |
| **US-8** | Sebagai admin, saya bisa melihat daftar semua booking (Pending/Approved) untuk approval cepat. | Dashboard admin untuk monitoring | Semua booking |
| **US-9** | Sebagai user, saya bisa mendapatkan notifikasi email ketika booking disetujui/ditolak. | Update status real-time | Email integration |
| **US-10** | Sebagai user, saya bisa melihat histori booking yang sudah lewat. | Riwayat penggunaan ruangan | Pagination & filter |
| **US-11** | Sebagai admin, saya bisa mengedit/lihat detail booking apapun. | Kontrol penuh atas data | Permission check |
| **US-12** | Sebagai user, saya bisa mendapatkan reminder sebelum waktu booking. | Notifikasi preventif | Timer & scheduling |

#### 4.1.2 Feature Breakdown (Beta)

| Feature | Priority | Effort (SP) | Status | Owner |
|---------|----------|-------------|--------|-------|
| Batalkan Booking | Must Have | 13 | ⏳ In Progress | Backend |
| Admin Booking List | Must Have | 21 | ⏳ In Progress | Backend |
| Email Notifications | Should Have | 42 | ⏳ Planned | DevOps |
| Booking History | Should Have | 21 | ⏳ Planned | Frontend |
| Admin Detail View | Must Have | 13 | ⏳ Planned | Frontend |
| Booking Reminders | Should Have | 35 | ⏳ Planned | DevOps |
| Mobile Optimization | Must Have | 21 | ⏳ Planned | Frontend |

### 4.2 Timeline (Beta)

| Bulan | Milestone | Delivered Features |
|-------|-----------|-------------------|
| **4** | Setup Email Service | Email notifications setup |
| **5** | Batalkan Booking | User bisa cancel booking |
| **6** | Admin List | Booking list dengan filter |
| **6** | Mobile Responsive | Layout tablet/mobile |
| **6** | Beta Testing | Uji coba internal |

---

## 5. Fase Expansion (Q3 2026)

### 5.1 Prioritas Expansion

#### 5.1.1 User Stories (Expansion)

| # | User Story | Business Value | Dependencies |
|---|-------------|----------------|-------------|
| **US-13** | Sebagai admin, saya bisa mengatur ruangan per organisasi (multi-tenant). | Skalabilitas untuk beberapa organisasi |
| **US-14** | Sebagai user, saya bisa membuat booking berulang (harian/mingguan/bulanan). | Efisiensi recurring booking |
| **US-15** | Sebagai user, saya bisa melihat riwayat penggunaan per ruangan (statistik). | Analytics pribadi |
| **US-16** | Sebagai admin, saya bisa mengintegrasikan dengan sistem universitas (single sign-on). | SSO, data mahasiswa dari kampus |
| **US-17** | Sebagai user, saya bisa mendapatkan notifikasi push ke aplikasi mobile. | Notifikasi real-time |
| **US-18** | Sebagai admin, saya bisa mengatur periode jam operasional per ruangan. | Fleksibilitas schedule |

#### 5.1.2 Feature Breakdown (Expansion)

| Feature | Priority | Effort (SP) | Status | Owner |
|---------|----------|-------------|--------|-------|
| Multi-Tenant | Should Have | 63 | ⏳ Planned | Backend |
| Recurring Booking | Should Have | 42 | ⏳ Planned | Backend |
| User Analytics | Should Have | 28 | ⏳ Planned | Analytics |
| SSO Integration | Should Have | 35 | ⏳ Planned | DevOps |
| Push Notifications | Should Have | 49 | ⏳ Planned | DevOps |
| Custom Hours | Should Have | 21 | ⏳ Planned | Backend |

### 5.2 Timeline (Expansion)

| Bulan | Milestone | Delivered Features |
|-------|-----------|-------------------|
| **7** | Multi-Tenant Setup | Schema untuk organisasi |
| **8** | Recurring Booking | Form + rule engine |
| **9** | User Analytics | Dashboard per user |
| **9** | SSO Integration | OAuth2 untuk universitas |
| **9** | Mobile Push | Expo/Native app |
| **9** | Custom Hours | Rule-based scheduling |
| **9** | Beta Testing | Uji coba organisasi |

---

## 6. Fase Enterprise (Q4 2026)

### 6.1 Prioritas Enterprise

#### 6.1.1 User Stories (Enterprise)

| # | User Story | Business Value | Dependencies |
|---|-------------|----------------|-------------|
| **US-19** | Sebagai admin, saya bisa mengatur akses API untuk aplikasi eksternal. | Integration ecosystem |
| **US-20** | Sebagai user, saya bisa melihat tampilan analytics usage yang komprehensif. | Business intelligence |
| **US-21** | Sebagai admin, saya bisa mengatur keamanan tingkat lanjut (2FA, IP whitelist). | Enterprise security |
| **US-22** | Sebagai user, saya bisa melihat perkiraan penggunaan puncak dan optimalisasi. | Smart booking suggestions |
| **US-23** | Sebagai admin, saya bisa mengatur rate limiting per user/organization. | Abuse prevention |
| **US-24** | Sebagai user, saya bisa mendapatkan rekomendasi ruangan berdasarkan histori. | Personal assistant |

#### 6.1.2 Feature Breakdown (Enterprise)

| Feature | Priority | Effort (SP) | Status | Owner |
|---------|----------|-------------|--------|-------|
| API Gateway | Should Have | 84 | ⏳ Planned | DevOps |
| Advanced Analytics | Should Have | 70 | ⏳ Planned | Analytics |
| 2FA Authentication | Should Have | 35 | ⏳ Planned | Backend |
| IP Whitelist | Should Have | 28 | ⏳ Planned | Security |
| Rate Limiting | Should Have | 21 | ⏳ Planned | DevOps |
| Smart Recommendations | Should Have | 42 | ⏳ Planned | ML |
| Enterprise Dashboard | Should Have | 56 | ⏳ Planned | Frontend |

### 6.2 Timeline (Enterprise)

| Bulan | Milestone | Delivered Features |
|-------|-----------|-------------------|
| **10** | API Setup | Gateway + authentication |
| **11** | Advanced Analytics | Real-time dashboards |
| **11** | Security Features | 2FA, IP whitelist |
| **11** | Rate Limiting | API abuse prevention |
| **11** | ML Recommendations | Smart suggestions |
| **12** | Enterprise Dashboard | Control panel |
| **12** | Production Deployment | Scaling to 2k+ users |
| **12** | Launch v4.0 (Enterprise) | |

---

## 7. Dependency Matrix

### 7.1 Feature Dependencies

| Feature | Dependencies | Blockers | Owner |
|---------|-------------|----------|-------|
| Autentikasi | Infrastructure setup | Database connection | Backend |
| CRUD Ruangan | Autentikasi, Database | Schema approval | Backend |
| Booking | CRUD Ruangan, Autentikasi | Feature US-2 | Backend |
| Kalender | Booking | Feature US-4 | Frontend |
| Approval | Booking, Autentikasi | Feature US-5 | Backend |
| Batalkan Booking | Booking, Autentikasi | Feature US-7 | Backend |
| Admin List | Batalkan Booking, Autentikasi | Feature US-8 | Frontend |
| Multi-Tenant | Infrastructure, Scaling | DevOps setup | Backend |
| Recurring Booking | Conflict detection | Feature US-14 | Backend |
| SSO Integration | User management | External system | DevOps |
| API Gateway | Load balancing, Security | Security hardening | DevOps |

### 7.2 Resource Planning

| Resource | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 | Bulan 5 | Bulan 6 | Bulan 7 | Bulan 8 | Bulan 9 | Bulan 10 | Bulan 11 | Bulan 12 |
|----------|---------|---------|---------|---------|---------|---------|---------|---------|---------|----------|----------|----------|
| Backend Developer | 3 | 3 | 3 | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 1 | 1 |
| Frontend Developer | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| DevOps Engineer | 1 | 1 | 1 | 2 | 2 | 2 | 1 | 1 | 1 | 2 | 2 | 2 |
| Database Specialist | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| QA Tester | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Designer | 0 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total Man-Hour** | **8** | **11** | **11** | **11** | **10** | **10** | **9** | **9** | **9** | **9** | **9** | **9** |

---

## 8. Milestone Summary

### 8.1 Milestone Checklist

| Milestone | Status | Deliverables | Approval Required |
|-----------|--------|-------------|------------------|
| Setup & Architecture | ✅ Complete | Infrastructure ready | DevOps |
| MVP Core Features | ✅ Complete | All core features | Product Owner |
| MVP Testing | ✅ Complete | Test coverage >80% | QA |
| Beta Features | ⏳ In Progress | Booking cancel, Admin list | Product Owner |
| Beta Testing | ⏳ Planned | User acceptance testing | Users |
| Expansion Features | ⏳ Planned | Multi-tenant, Recurring | Product Owner |
| Expansion Testing | ⏳ Planned | Integration testing | QA |
| Enterprise Features | ⏳ Planned | API, Analytics, Security | Product Owner |
| Enterprise Testing | ⏳ Planned | Load testing | QA |

### 8.2 Success Metrics (Per Milestone)

| Metric | MVP | Beta | Expansion | Enterprise |
|--------|-----|------|-----------|-----------|
| Feature Complete | 6/6 | 6/6 | 6/6 | 6/6 |
| Uptime (%) | >95% | >97% | >98% | >99% |
| User Count | 10 | 100 | 500 | 2.000 |
| Response Time | <1s | <0.5s | <0.3s | <0.2s |
| Test Coverage | >80% | >85% | >90% | >95% |

---

## 9. Risk Management

### 9.1 Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|-----------|-------|
| Technology Debt | Medium | Medium | Code review, test | Backend |
| User Onboarding | High | High | UX research | Product |
| Database Performance | Low | Medium | Indexes, monitoring | DevOps |
| Security Breach | Low | Critical | Pen testing | Security |
| Deployment Failure | Medium | High | CI/CD, rollback | DevOps |

### 9.2 Contingency Plans

| Risk | Trigger | Response | Timeline |
|------|---------|----------|----------|
| Deployment Failure | Test environment broken | Rollback to previous stable version | 30 menit |
| Performance Degradation | Response time > 2s | Scale up infrastructure | 1 jam |
| Security Issue | Vulnerability discovered | Hotfix + notification | 4 jam |
| User Adoption | Usage < 60% | Marketing campaign | 2 minggu |

---

## 10. Budget Estimation

### 10.1 Resource Cost

| Resource | Biaya per Bulan | Total per Fase | Total per Tahun |
|----------|----------------|----------------|----------------|
| Backend Developer (1 FTE) | $3.500 | $23.100 | $69.300 |
| Frontend Developer (1 FTE) | $3.200 | $21.120 | $63.360 |
| DevOps Engineer (0.5 FTE) | $2.800 | $18.480 | $55.440 |
| Database Specialist (0.5 FTE) | $2.500 | $16.240 | $48.720 |
| QA Tester (0.5 FTE) | $2.000 | $13.000 | $39.000 |
| Designer (0.25 FTE) | $1.800 | $7.560 | $22.680 |
| Infrastructure | $1.200 | $7.920 | $23.760 |
| **Total** | — | **$107.400** | **$322.260** |

### 10.2 Operational Cost

| Item | Biaya per Bulan | Catatan |
|------|----------------|--------|
| VPS/Cloud Server | $150 | Production |
| Domain & SSL | $20 | himaspace.karsa-dev.my.id |
| Monitoring Tools | $30 | Uptime, error tracking |
| Backup Storage | $25 | Database backup |
| **Total Bulanan** | **$225** | |
| **Total Tahunan** | **$2.700** | |

---

## 11. Timeline Summary

### 11.1 Gantt Chart (High-Level)

```
2026
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Phase: MVP (Bulan 1-3)            Phase: Beta (Bulan 4-6)        Phase: Expansion (Bulan 7-9) │
│  (Core Features)                   (Stability & Usability)      (Growth & Integrations)       │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│ Bulan 1        │ Bulan 2        │ Bulan 3        │ Bulan 4        │ Bulan 5        │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Autentikasi     │ CRUD Ruangan   │ Booking         │ Batalkan Booking │ Admin List     │
│ Kalender        │ Feature Testing│ Feature Testing │ Feature Testing │ Feature Testing│
│ Approval        │ Deployment      │ Deployment      │ Email Setup     │ Mobile Optimized│
│ Dashboard       │ Bug Fixes      │ Bug Fixes       │ Testing         │ Beta Testing   │
│ Validation      │ Documentation   │ Documentation   │ User Testing    │ Production Prep│
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Phase 4: Enterprise (Bulan 10-12)
├─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│ Bulan 7        │ Bulan 8        │ Bulan 9        │ Bulan 10       │ Bulan 11       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Multi-Tenant   │ Recurring Booking│ User Analytics  │ API Gateway     │ Advanced Analytics│
│ SSO Integration │                 │                 │ 2FA & Security  │ ML Recommendations│
│ Push Notifications│              │                 │ Rate Limiting   │ Enterprise Dashboard│
│                 │                 │                 │ Load Testing   │ Production Deployment│
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### 11.2 Key Dates

| Tanggal | Acara | Status |
|---------|---------|--------|
| **2026-06-22** | Kickoff Project | ✅ Complete |
| **2026-07-22** | MVP Demo | ⏳ Planned |
| **2026-09-22** | Beta Launch | ⏳ Planned |
| **2026-11-22** | Expansion Launch | ⏳ Planned |
| **2026-12-22** | Enterprise Launch | ⏳ Planned |
| **2027-03-22** | First Review | ⏳ Planned |
| **2027-06-22** | Second Review | ⏳ Planned |
| **2027-09-22** | Third Review | ⏳ Planned |
| **2027-12-22** | Fourth Review | ⏳ Planned |

---

## 12. Success Criteria

### 12.1 Product Success

| Kriteria | Target | Toleransi |
|----------|--------|----------|
| User Satisfaction | >8/10 (survey) | >7/10 |
| Feature Completeness | >95% dari user stories | >90% |
| Bug Rate | <5 bug per 1.000 session | <10 bug per 1.000 session |
| Performance | <500ms response time | <1s |
| Security | >99% compliance | >98% |

### 12.2 Business Success

| KPI | Target (Bulan 1) | Target (Bulan 6) | Target (Bulan 12) |
|-----|------------------|------------------|------------------|
| Total Users | 10 | 100 | 2.000 |
| Monthly Active Users | 5 | 50 | 500 |
| Revenue (proyeksi) | $0 | $1.000 | $50.000 |
| Retention | 60% | 70% | 80% |

---

*Dokumen ini memandu pengembangan HIMA Space dari MVP ke Enterprise. Setiap fase membangun di atas fondasi yang solid, memastikan skalabilitas, keamanan, dan kemudahan penggunaan.*

---

*Untuk detail implementasi, lihat TRD.md dan FSD.md.*
