# TESTING — HIMA Space

> **Testing Strategy & Documentation**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: FSD v1.0, TRD v1.0

---

## 1. Overview

### 1.1 Testing Philosophy

HIMA Space menerapkan testing berlapis (layered testing) dengan prinsip:

1. **Test Early** — Unit test saat development
2. **Test Often** — CI/CD pipeline otomatis
3. **Test Thoroughly** — Multiple test layers
4. **Test Realistically** — Environment mirip production

### 1.2 Testing Pyramid

```
                        ┌─────────────────┐
                        │   E2E Tests     │  ← Slow, expensive, few
                        │   (Cypress)     │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    Integration Tests    │  ← Medium, moderate count
                    │    (Jest + Supertest)   │
                    └────────────┬────────────┘
                                 │
               ┌─────────────────┴─────────────────┐
               │          Unit Tests               │  ← Fast, cheap, many
               │          (Jest)                   │
               └───────────────────────────────────┘
```

### 1.3 Test Distribution

| Layer | Tools | Coverage Target | Count |
|-------|-------|----------------|-------|
| Unit Tests | Jest | >80% functions | ~50 |
| Integration Tests | Jest + Supertest | >70% API endpoints | ~20 |
| E2E Tests | Cypress | Critical user flows | ~10 |
| Manual Testing | Human | Edge cases, UX | Ad-hoc |

---

## 2. Unit Testing

### 2.1 Framework Setup

**Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.test.ts']
};
```

### 2.2 Unit Test Areas

#### Authentication
| Test Case | Description | Expected |
|-----------|-------------|----------|
| `auth.test.ts` | Generate JWT token | Valid token generated |
| `auth.test.ts` | Verify valid token | Payload returned |
| `auth.test.ts` | Verify invalid token | Error thrown |
| `auth.test.ts` | Verify expired token | Error thrown |
| `password.test.ts` | Hash password | Hashed password returned |
| `password.test.ts` | Verify correct password | true returned |
| `password.test.ts` | Verify wrong password | false returned |

#### Validation
| Test Case | Description | Expected |
|-----------|-------------|----------|
| `validation.test.ts` | Valid email format | true |
| `validation.test.ts` | Invalid email format | false |
| `validation.test.ts` | Valid time format (HH:mm) | true |
| `validation.test.ts` | Invalid time format | false |
| `validation.test.ts` | jamSelesai > jamMulai | true |
| `validation.test.ts` | jamSelesai <= jamMulai | false |
| `validation.test.ts` | Date not in past | true |
| `validation.test.ts` | Date in past | false |

#### Business Logic
| Test Case | Description | Expected |
|-----------|-------------|----------|
| `booking.test.ts` | No conflict detected | null |
| `booking.test.ts` | Conflict detected (overlap) | Booking object |
| `booking.test.ts` | Conflict not detected (Rejected status) | null |
| `booking.test.ts` | Adjacent bookings (no overlap) | null |

### 2.3 Unit Test Example

```typescript
// __tests__/lib/validation.test.ts

import { validateTime, isTimeAfter, validateEmail } from '@/lib/validation';

describe('Validation Functions', () => {
  describe('validateTime', () => {
    it('should accept valid time "13:00"', () => {
      expect(validateTime('13:00')).toBe(true);
    });

    it('should accept time "00:00"', () => {
      expect(validateTime('00:00')).toBe(true);
    });

    it('should accept time "23:59"', () => {
      expect(validateTime('23:59')).toBe(true);
    });

    it('should reject invalid hour "25:00"', () => {
      expect(validateTime('25:00')).toBe(false);
    });

    it('should reject invalid minute "13:60"', () => {
      expect(validateTime('13:60')).toBe(false);
    });

    it('should reject time with seconds "13:00:00"', () => {
      expect(validateTime('13:00:00')).toBe(false);
    });
  });

  describe('isTimeAfter', () => {
    it('should return true if time1 > time2', () => {
      expect(isTimeAfter('15:00', '13:00')).toBe(true);
    });

    it('should return false if time1 <= time2', () => {
      expect(isTimeAfter('13:00', '13:00')).toBe(false);
      expect(isTimeAfter('12:00', '13:00')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.id')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });
});
```

---

## 3. Integration Testing

### 3.1 API Testing with Supertest

**Setup:**
```typescript
// __tests__/setup.ts
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function createTestUser(role: 'admin' | 'mahasiswa' = 'mahasiswa') {
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);

  return prisma.user.create({
    data: {
      nama: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: hashedPassword,
      role
    }
  });
}

export function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

export async function cleanup() {
  await prisma.booking.deleteMany();
  await prisma.ruangan.deleteMany();
  await prisma.user.deleteMany();
}
```

### 3.2 API Test Cases

#### Auth API
| Endpoint | Test Case | Status | Description |
|----------|-----------|--------|-------------|
| POST /api/auth/login | Valid credentials | 200 | Token returned |
| POST /api/auth/login | Invalid email | 422 | Error message |
| POST /api/auth/login | Invalid password | 422 | Error message |
| POST /api/auth/login | Missing fields | 422 | Validation error |

#### Ruangan API
| Endpoint | Test Case | Status | Description |
|----------|-----------|--------|-------------|
| GET /api/ruangan | List all | 200 | Array returned |
| POST /api/ruangan | Create (admin) | 201 | Ruangan created |
| POST /api/ruangan | Create (mahasiswa) | 403 | Forbidden |
| POST /api/ruangan | Duplicate name | 422 | Error message |
| PUT /api/ruangan/:id | Update | 200 | Updated ruangan |
| DELETE /api/ruangan/:id | Delete | 200 | Success message |

#### Booking API
| Endpoint | Test Case | Status | Description |
|----------|-----------|--------|-------------|
| POST /api/booking | Create booking | 201 | Booking created |
| POST /api/booking | Conflict detected | 422 | Conflict error |
| POST /api/booking | Invalid time | 422 | Validation error |
| GET /api/booking | List user bookings | 200 | Array returned |
| PATCH /api/booking/:id/cancel | Cancel own booking | 200 | Cancelled |
| PATCH /api/booking/:id/cancel | Cancel other's booking | 403 | Forbidden |
| PATCH /api/booking/:id/approve | Approve (admin) | 200 | Approved |
| PATCH /api/booking/:id/reject | Reject (admin) | 200 | Rejected |

### 3.3 Integration Test Example

```typescript
// __tests__/api/booking.test.ts

import request from 'supertest';
import { createTestUser, generateToken, cleanup } from '../setup';

// Mock Next.js app for testing
const app = require('@/app/api/route').default;

describe('Booking API', () => {
  let adminToken: string;
  let userToken: string;
  let testRuangan: any;

  beforeAll(async () => {
    const admin = await createTestUser('admin');
    const user = await createTestUser('mahasiswa');
    adminToken = generateToken(admin);
    userToken = generateToken(user);

    // Create test ruangan
    testRuangan = await prisma.ruangan.create({
      data: {
        nama: 'Ruang Test',
        kapasitas: 20,
        fasilitas: '["AC"]',
        aktif: true
      }
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('POST /api/booking', () => {
    it('should create booking successfully', async () => {
      const res = await request(app)
        .post('/api/booking')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          judul: 'Rapat Test',
          ruanganId: testRuangan.id,
          tanggal: '2026-12-31',
          jamMulai: '13:00',
          jamSelesai: '15:00'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.judul).toBe('Rapat Test');
      expect(res.body.data.status).toBe('Pending');
    });

    it('should return 422 on conflict', async () => {
      // Create first booking
      await prisma.booking.create({
        data: {
          judul: 'Existing Booking',
          ruanganId: testRuangan.id,
          userId: 1,
          tanggal: new Date('2026-12-31'),
          jamMulai: '13:00',
          jamSelesai: '15:00',
          status: 'Approved'
        }
      });

      // Try to create overlapping booking
      const res = await request(app)
        .post('/api/booking')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          judul: 'Conflicting Booking',
          ruanganId: testRuangan.id,
          tanggal: '2026-12-31',
          jamMulai: '14:00',
          jamSelesai: '16:00'
        });

      expect(res.status).toBe(422);
      expect(res.body.message).toContain('bentrok');
    });
  });
});
```

---

## 4. E2E Testing

### 4.1 Cypress Setup

**Installation:**
```bash
npm install cypress --save-dev
npx cypress open
```

**Config:**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720
  }
});
```

### 4.2 Critical User Flows

| Flow | Priority | Status |
|------|----------|--------|
| Login → View Calendar → Book Room | P1 | ⏳ Planned |
| Admin → Approve Booking | P1 | ⏳ Planned |
| User → Cancel Booking | P1 | ⏳ Planned |
| Admin → CRUD Ruangan | P2 | ⏳ Planned |
| User → View History | P2 | ⏳ Planned |
| Login → Error Handling | P2 | ⏳ Planned |

### 4.3 E2E Test Example

```javascript
// cypress/e2e/booking.cy.js

describe('Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('budi@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/kalender');
  });

  it('should book a room successfully', () => {
    // Click on empty slot
    cy.get('.fc-daygrid-event').should('have.length', 0);
    cy.get('.fc-day[data-date="2026-12-25"]').click();

    // Fill booking form
    cy.get('input[name="judul"]').type('Rapat Pengurus');
    cy.get('select[name="ruanganId"]').select('Ruang HIMA');
    cy.get('input[name="jamMulai"]').type('13:00');
    cy.get('input[name="jamSelesai"]').type('15:00');

    // Submit
    cy.get('button[type="submit"]').contains('Booking Sekarang').click();

    // Verify success
    cy.get('.toast-success').should('be.visible');
    cy.get('.toast-success').should('contain', 'Booking berhasil');

    // Event should appear on calendar
    cy.get('.fc-daygrid-event').should('contain', 'Rapat Pengurus');
  });

  it('should show conflict error', () => {
    // Try to book overlapping time
    cy.get('.fc-day[data-date="2026-12-25"]').click();
    cy.get('input[name="judul"]').type('Conflicting Booking');
    cy.get('select[name="ruanganId"]').select('Ruang HIMA');
    cy.get('input[name="jamMulai"]').type('14:00');
    cy.get('input[name="jamSelesai"]').type('16:00');
    cy.get('button[type="submit"]').click();

    // Should show conflict error
    cy.get('.toast-error').should('be.visible');
    cy.get('.toast-error').should('contain', 'bentrok');
  });
});
```

### 4.4 E2E Test - Admin Approval

```javascript
// cypress/e2e/admin-approval.cy.js

describe('Admin Approval Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@hima.id');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('should approve a booking', () => {
    // Go to approval page
    cy.get('a[href="/admin/approval"]').click();
    cy.url().should('include', '/admin/approval');

    // Should show pending bookings
    cy.get('[data-testid="booking-card"]').should('have.length.greaterThan', 0);

    // Click approve on first booking
    cy.get('[data-testid="booking-card"]').first()
      .find('button:contains("Approve")').click();

    // Confirm approval
    cy.get('button:contains("Ya, Approve")').click();

    // Success message
    cy.get('.toast-success').should('contain', 'disetujui');

    // Booking should disappear from pending list
    cy.get('[data-testid="booking-card"]').should('have.length', 0);
  });
});
```

---

## 5. Test Environments

### 5.1 Environment Setup

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| Development | localhost:3000 | hima_space_dev | Local development |
| Test | localhost:3001 | hima_space_test | Automated testing |
| Staging | staging.himaspace.my.id | hima_space_staging | Pre-production |
| Production | himaspace.my.id | hima_space | Live |

### 5.2 Test Database

```bash
# Create test database
createdb hima_space_test

# Run migrations
DATABASE_URL=postgresql://localhost:5432/hima_space_test npx prisma migrate deploy

# Seed test data
DATABASE_URL=postgresql://localhost:5432/hima_space_test npx prisma db seed
```

### 5.3 Test Data Management

**Seed Script:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@hima.id' },
    update: {},
    create: {
      nama: 'Admin HIMA',
      email: 'admin@hima.id',
      password: adminPassword,
      role: 'admin'
    }
  });

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      password: userPassword,
      role: 'mahasiswa'
    }
  });

  // Create test rooms
  const rooms = [
    { nama: 'Ruang HIMA', kapasitas: 30, fasilitas: '["AC","Proyektor"]' },
    { nama: 'Aula Serbaguna', kapasitas: 100, fasilitas: '["AC","Sound System"]' },
    { nama: 'Ruang Rapat', kapasitas: 15, fasilitas: '["AC","Whiteboard"]' }
  ];

  for (const room of rooms) {
    await prisma.ruangan.upsert({
      where: { nama: room.nama },
      update: {},
      create: room
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: hima_space_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/hima_space_test

      - name: Run seed
        run: npx prisma db seed
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/hima_space_test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/hima_space_test
          JWT_SECRET: test-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 6.2 Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/api",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## 7. Manual Testing

### 7.1 Test Checklist

#### Authentication
- [ ] User bisa login dengan email & password yang benar
- [ ] User tidak bisa login dengan password salah
- [ ] User tidak bisa login dengan email tidak terdaftar
- [ ] Token tersimpan di localStorage
- [ ] User ter-redirect setelah login (admin → dashboard, mahasiswa → kalender)
- [ ] Logout berhasil (token dihapus, redirect ke login)
- [ ] Halaman yang dilindungi tidak bisa diakses tanpa token

#### CRUD Ruangan (Admin)
- [ ] Admin bisa melihat daftar ruangan
- [ ] Admin bisa menambah ruangan baru
- [ ] Admin bisa edit ruangan
- [ ] Admin bisa nonaktifkan ruangan
- [ ] Admin bisa aktifkan kembali ruangan
- [ ] Validasi: nama wajib diisi, kapasitas minimal 1
- [ ] Error message muncul jika nama sudah ada

#### Booking Ruangan
- [ ] Mahasiswa bisa lihat kalender
- [ ] Mahasiswa bisa pilih slot waktu
- [ ] Form booking muncul dengan data terisi
- [ ] Mahasiswa bisa isi judul, deskripsi (opsional)
- [ ] Pengecekan konflik berfungsi
- [ ] Error muncul jika ada konflik
- [ ] Booking berhasil disimpan dengan status Pending
- [ ] Booking muncul di kalender dengan warna kuning

#### Approval (Admin)
- [ ] Admin bisa lihat daftar booking pending
- [ ] Admin bisa approve booking
- [ ] Admin bisa reject booking (dengan alasan opsional)
- [ ] Status berubah setelah approve/reject
- [ ] Booking tidak bisa di-approve/reject ulang

#### Dashboard
- [ ] Statistik benar (total ruangan, booking hari ini)
- [ ] Booking pending muncul di daftar
- [ ] Quick actions berfungsi

### 7.2 Browser Testing Matrix

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | Latest | ✅ | ✅ | Required |
| Firefox | Latest | ✅ | ✅ | Required |
| Safari | Latest | ✅ | ✅ | Required |
| Edge | Latest | ✅ | — | Required |
| Samsung Internet | Latest | — | ✅ | Recommended |

### 7.3 Device Testing

| Device | OS | Screen Size | Status |
|--------|-----|-------------|--------|
| Desktop | Windows/macOS | >= 1024px | Required |
| iPad | iOS 15+ | 768-1024px | Recommended |
| iPhone | iOS 15+ | < 768px | Required |
| Android Phone | Android 10+ | < 768px | Required |

---

## 8. Performance Testing

### 8.1 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.8s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.8s | Lighthouse |
| API Response Time | < 500ms | p95 |
| Database Query Time | < 100ms | p95 |

### 8.2 Load Testing

**Tools:**
- k6 (recommended)
- Apache JMeter
- Artillery

**k6 Script Example:**
```javascript
// loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/kalender');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

---

## 9. Security Testing

### 9.1 Security Checklist

| Category | Test Case | Status |
|----------|-----------|--------|
| **Authentication** | Password hashing (bcrypt) | ✅ Implemented |
| **Authentication** | JWT expiry (24h) | ✅ Implemented |
| **Authorization** | Role-based access | ✅ Implemented |
| **Input Validation** | SQL injection prevention | ✅ Prisma ORM |
| **Input Validation** | XSS prevention | ✅ React auto-escape |
| **Input Validation** | CSRF protection | ⏳ Planned |
| **API Security** | Rate limiting | ⏳ Planned |
| **API Security** | Input sanitization | ✅ Implemented |

### 9.2 Security Scanning

**Tools:**
- npm audit
- Snyk
- OWASP ZAP (for API)

**npm audit:**
```bash
npm audit
npm audit fix
```

---

## 10. Accessibility Testing

### 10.1 WCAG 2.1 Compliance

| Level | Criterion | Status | Notes |
|-------|-----------|--------|-------|
| A | Keyboard accessible | ✅ | All interactive elements |
| A | Screen reader compatible | ✅ | Semantic HTML, ARIA |
| A | Color contrast | ✅ | >4.5:1 ratio |
| A | Alt text for images | ✅ | All icons/images |
| AA | Focus indicators | ✅ | Visible focus ring |
| AA | Text resize | ✅ | Up to 200% |
| AA | Reflow | ✅ | No horizontal scroll |

### 10.2 Accessibility Testing Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| axe-core | Automated a11y testing | Jest, Cypress |
| Lighthouse | Performance + a11y audit | Chrome DevTools |
| NVDA / VoiceOver | Screen reader testing | Manual |

---

## 11. Bug Reporting

### 11.1 Bug Report Template

```markdown
## Bug Report

**Title:** [Short description]

**Environment:**
- Browser: Chrome 120
- OS: macOS 14.2
- Screen: Desktop 1920x1080

**Steps to Reproduce:**
1. Go to '/kalender'
2. Click on empty slot
3. Fill form with...
4. Click 'Booking'

**Expected Result:**
Booking should be created with status Pending

**Actual Result:**
Error message "Terjadi kesalahan server" appears

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste any console errors]
```

### 11.2 Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | System down, data loss | 4 hours |
| **High** | Major feature broken | 24 hours |
| **Medium** | Feature partially working | 3 days |
| **Low** | Minor issue, cosmetic | 1 week |

---

## 12. Test Reporting

### 12.1 Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Open report
open coverage/lcov-report/index.html
```

### 12.2 CI/CD Reports

GitHub Actions will automatically:
1. Run all tests
2. Generate coverage report
3. Upload to Codecov
4. Comment on PR with coverage diff

### 12.3 Test Summary Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                   TEST SUMMARY - HIMA Space                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Unit Tests:        48 passed, 0 failed      ✅ 100%          │
│  Integration Tests: 22 passed, 0 failed      ✅ 100%          │
│  E2E Tests:         8 passed, 0 failed       ✅ 100%          │
│                                                                 │
│  Coverage:                                                │
│  ├── Statements:  85%  ████████████████░░░░                  │
│  ├── Branches:    82%  ███████████████░░░░░░                  │
│  ├── Functions:   88%  █████████████████░░░                  │
│  └── Lines:       86%  ████████████████░░░░                  │
│                                                                 │
│  Last Run: 2026-06-22 10:30:00 UTC                             │
│  Duration: 45s                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Testing Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run E2E tests (headless) |
| `npm run test:e2e:open` | Open Cypress GUI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npx jest --testNamePattern="login"` | Run specific test |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Unit Test** | Test fungsi/组件 individual |
| **Integration Test** | Test interaksi antar komponen |
| **E2E Test** | Test seluruh user flow |
| **Coverage** | Persentase kode yang diuji |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **WCAG** | Web Content Accessibility Guidelines |
| **p95** | Persentil ke-95 (95% request lebih cepat dari ini) |

---

*Dokumen ini mendefinisikan strategi testing HIMA Space. Semua fitur harus diuji sesuai guideline sebelum production.*
