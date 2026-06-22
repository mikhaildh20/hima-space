# HIMA Space

> Booking & Manajemen Ruangan Organisasi Mahasiswa

## Overview

HIMA Space adalah aplikasi web untuk booking dan manajemen penggunaan ruangan organisasi atau himpunan mahasiswa.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT (24h expiry)
- **Deployment:** PM2, Nginx, GitHub Actions CI/CD

## Features

- ✅ Calendar view with interactive booking
- ✅ Admin approval workflow
- ✅ Room management (CRUD)
- ✅ Booking history & filters
- ✅ Dashboard statistics
- ✅ Role-based access (Admin & Mahasiswa)

## Documentation

- [PRD.md](PRD.md) - Product Requirements
- [FSD.md](FSD.md) - Functional Specification
- [HLD.md](HLD.md) - High-Level Design
- [TRD.md](TRD.md) - Technical Design
- [ERD.md](ERD.md) - Database Schema
- [WIREFRAME.md](WIREFRAME.md) - UI/UX Layout
- [DESIGN.md](DESIGN.md) - Design System
- [ROADMAP.md](ROADMAP.md) - Development Roadmap
- [TESTING.md](TESTING.md) - Testing Strategy

## Quick Start

```bash
# Clone repository
git clone https://github.com/mikhaildh20/hima-space.git
cd hima-space

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Using PM2

```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config for auto-restart
pm2 save
pm2 startup
```

### Using Deploy Script

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production <commit-sha>
```

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/ci.yml` file defines the CI/CD pipeline with:

1. **Test Job** - Runs unit and integration tests
2. **Build Job** - Compiles the Next.js application
3. **Deploy Job** - Sends webhook to trigger deployment

### Required GitHub Secrets

Add these in your repository Settings → Secrets and variables → Actions:

- `DEPLOY_WEBHOOK_URL` - Webhook endpoint (https://himaspace.karsa-dev.my.id/webhook)
- `WEBHOOK_SECRET` - Webhook signature verification secret

### Webhook Receiver

The webhook receiver runs on port 5001 and validates incoming webhooks using the `WEBHOOK_SECRET`.

## Environment Variables

```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/hima_space?schema=public"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

## Database Setup

```bash
# Create database
createdb hima_space

# Run migrations
npx prisma migrate dev

# Seed with test data
npm run db:seed

# Or reset and reseed
npx prisma migrate reset
```

## API Routes

### Authentication
- `POST /api/auth/login` - Login and receive JWT token

### Rooms
- `GET /api/ruangan` - List all rooms
- `POST /api/ruangan` - Create room (Admin only)
- `PUT /api/ruangan/:id` - Update room
- `DELETE /api/ruangan/:id` - Delete room

### Bookings
- `GET /api/booking` - List bookings (with filters)
- `POST /api/booking` - Create booking
- `PATCH /api/booking/:id/cancel` - Cancel booking
- `GET /api/booking/pending` - List pending bookings (Admin)
- `PATCH /api/booking/:id/approve` - Approve booking (Admin)
- `PATCH /api/booking/:id/reject` - Reject booking (Admin)

### Calendar
- `GET /api/kalender` - Get calendar events (FullCalendar format)

### Dashboard
- `GET /api/dashboard` - Get statistics

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Open Cypress GUI
npm run test:e2e:open
```

## Project Structure

```
hima-space/
├── .github/workflows/
│   └── ci.yml                    # CI/CD pipeline
├── prisma/
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Seed script
├── src/
│   ├── app/                      # Next.js app routes
│   │   ├── api/                  # API routes
│   │   ├── admin/                # Admin pages
│   │   ├── kalender/             # Calendar view
│   │   └── booking/              # Booking pages
│   ├── components/               # React components
│   └── lib/                      # Utilities
│       ├── auth.ts               # JWT authentication
│       ├── prisma.ts             # Prisma client
│       └── validation.ts         # Validation utils
├── tests/                        # Jest tests
├── cypress/                      # Cypress E2E tests
├── deploy.sh                     # Deployment script
└── ecosystem.config.js           # PM2 config
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## License

This project is proprietary and confidential.

---

**Built with ❤️ by the development team**
