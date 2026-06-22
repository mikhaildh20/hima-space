# HIMA Space Development Log

Single source of truth for the narrative execution of the HIMA Space project.

## Log Entries

### [2026-06-22 23:14] - Phase 0 Setup (Antigravity Orchestrator)
- **Summary**: Initialized `BACKLOG.md` and `DEVLOG.md` to establish tracking baseline. Created task checklist.
- **Technical Decisions**: Set up documentation tracking layout in compliance with implementation plan.
- **Blockers & Fixes**: None.
- **Next Steps**: Begin `T-001` (Database and Prisma setup).

### [2026-06-22 23:20] - Task: T-001 - Database & Prisma Setup (Antigravity Orchestrator)
- **Summary**: Set up database models, executed migration initialization, created database seeding script. Downgraded Prisma dependencies to version `5.14.0` to match system docs and avoid Prisma 7 connection string deprecations.
- **Technical Decisions**: Configured `User`, `Ruangan`, and `Booking` models. Used standard BCrypt hashing for default password generation.
- **Blockers & Fixes**: Prisma 7 threw P1012 due to deprecation of `url` under schema. Downgraded to standard v5. User provided correct postgres database password (`123`).
- **Next Steps**: Begin `T-002` (Shared libs).
- **Commit**: `b38de23`

### [2026-06-22 23:21] - Task: T-002 - Shared Libraries & Auth Middleware (Antigravity Orchestrator)
- **Summary**: Implemented JWT helper utilities, validation utility functions, and Prisma client singleton provider.
- **Technical Decisions**: Created `validateEmail`, `validateTime`, `isTimeAfter`, and `isDateNotPast` helper logic. Implemented token extraction and verification helper logic in `src/lib/auth.ts`.
- **Blockers & Fixes**: None.
- **Next Steps**: Implement `T-008` (Core layout & UI styles).
- **Commit**: `3430153`

### [2026-06-22 23:22] - Task: T-008 - Core Layout & Global UI (Antigravity Orchestrator)
- **Summary**: Designed and built the global layout system, including custom scrollbars, AppShell client path checker, Navbar header, and role-based Sidebar layout.
- **Technical Decisions**: Implemented custom Client Component `AppShell.js` to guard auth-protected routes, manage loading indicators, and check if `token` is present in `localStorage`. Wrapped application in `layout.js` inside this component. Utilized inline SVGs to match custom Lucide icons.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-003` (Authentication API).
- **Commit**: `0b62e6d`

### [2026-06-22 23:24] - Task: T-003 - Authentication API Handlers (Antigravity Orchestrator)
- **Summary**: Created the backend authentication endpoints: `/api/auth/login` (POST), `/api/auth/logout` (POST), and `/api/auth/me` (GET).
- **Technical Decisions**: `/api/auth/login` validates standard fields and checks email against database before executing password verification via BCrypt. It generates and returns a JWT token. `/api/auth/me` verifies request authorization headers and queries user database profile omitting the password.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-004` (Room CRUD API).
- **Commit**: `b99eb81`

### [2026-06-22 23:24] - Task: T-004 - Room CRUD API Handlers (Antigravity Orchestrator)
- **Summary**: Implemented endpoints `/api/ruangan` (GET, POST) and `/api/ruangan/[id]` (GET, PUT, DELETE).
- **Technical Decisions**: Validated room input fields. Enforced uniqueness constraints case-insensitively on room name. Implemented custom soft delete toggle logic: if the room has any historical booking records in `bookings` table, toggled `aktif: false` (inactive state) to maintain database relational integrity, otherwise executed permanent `delete` query.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-005` (Booking API & Conflict Detection).
- **Commit**: `7f039fc`

### [2026-06-22 23:25] - Task: T-005 - Booking API & Conflict Engine (Antigravity Orchestrator)
- **Summary**: Built booking APIs: `/api/booking` (GET list, POST create) and `/api/booking/[id]` (GET details) and `/api/booking/[id]/cancel` (PATCH cancel).
- **Technical Decisions**: Implemented query parameters for filters and pagination. Built booking overlap engine utilizing query constraints (`existing.start < new.end AND existing.end > new.start`) filtering specifically by status `Approved`. Verified date strings normalize cleanly to UTC midnight dates to avoid offset sliding issues. Checked student ownership restrictions on cancellation requests, allowing admins to cancel any.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-006` (Booking Approval API).
- **Commit**: `4d36693`

### [2026-06-22 23:26] - Task: T-006 - Booking Approval API (Antigravity Orchestrator)
- **Summary**: Implemented approval APIs: `/api/booking/pending` (GET list), `/api/booking/[id]/approve` (PATCH), and `/api/booking/[id]/reject` (PATCH).
- **Technical Decisions**: Implemented chronological sorting for pending bookings queue. Configured `approve` route to perform a lock check (overlap conflict detection again) to prevent double approvals in concurrent situations. Enabled optional rejection reasons to be saved in the database under `rejectReason` column.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-007` (Calendar & Dashboard API).
- **Commit**: `0f60ad9`

### [2026-06-22 23:26] - Task: T-007 - Calendar & Dashboard API (Antigravity Orchestrator)
- **Summary**: Designed and built the statistics APIs: `/api/kalender` (GET monthly events array) and `/api/dashboard` (GET statistics aggregates).
- **Technical Decisions**: Formatted calendar results to comply with FullCalendar.js Event Object schema. Mapped color variants (`#22c55e` and `#eab308`) based on booking status. Standardized date queries dynamically at UTC midnight to query rooms, calculate counters, and filter active booking scopes.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-009` (Login View UI).
- **Commit**: `4bcc937`

### [2026-06-22 23:27] - Task: T-009 - Login View Interface (Antigravity Orchestrator)
- **Summary**: Built the client-side login visual interface (`/login`).
- **Technical Decisions**: Configured a responsive, modern card form UI using standard Tailwind. Bound inputs to React state and added loading indicators. Handled credentials verification request: saved `token` and `user` payload returned to `localStorage` and executed routing logic to redirect users based on role.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-010` (Calendar & Booking View UI).
- **Commit**: `65d0dd6`

### [2026-06-22 23:28] - Task: T-010 - Calendar & Booking View UI (Antigravity Orchestrator)
- **Summary**: Implemented the calendar grid page (`/kalender`), booking creation form (`/booking/new`), and booking details inspector (`/booking/[id]`).
- **Technical Decisions**: Developed a custom lightweight monthly calendar grid using pure React & Tailwind CSS. Added room filter dropdown triggers and client side date parameters pre-fill hooks. Mapped yellow/green indicators dynamically based on booking active statuses. Built an event detail modal overlays. Integrated cancel action triggers.
- **Blockers & Fixes**: Resolved searchParams access in Next.js v16 App Router using `<Suspense>` wrapper around components accessing searchParams.
- **Next Steps**: Start `T-011` (Room Management UI).
- **Commit**: `e993f27`

### [2026-06-22 23:30] - Task: T-011 - Room Management UI (Antigravity Orchestrator)
- **Summary**: Implemented the admin room management console page `/admin/ruangan`.
- **Technical Decisions**: Designed list views, edit and add modals, validated form inputs, handled APIs interaction, and structured status indicator tags.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-012` (Booking List & History UI).
- **Commit**: `92b956b`

### [2026-06-22 23:35] - Task: T-012 - Booking List & History UI (Antigravity Orchestrator)
- **Summary**: Created the booking history page `/histori` supporting filters and pagination.
- **Technical Decisions**: Implemented status filters tabs, paginated rendering using API query limits, owner checking for cancellation triggers, and a cancellation confirming modal.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-013` (Dashboard & Approval UI).
- **Commit**: `2c3a43b`

### [2026-06-22 23:40] - Task: T-013 - Dashboard & Approval UI (Antigravity Orchestrator)
- **Summary**: Implemented the admin dashboard `/admin/dashboard` and admin approval panel `/admin/approval`.
- **Technical Decisions**: Developed role redirection checks to protect admin routes. Populated `/admin/dashboard` with dynamic room and daily booking metrics. Built the `/admin/approval` list with interactive approve PATCH handlers and a reject modal submitting custom reasons.
- **Blockers & Fixes**: None.
- **Next Steps**: Start `T-014` (Jest Unit & Integration Setup).
- **Commit**: `2a0db0c`

### [2026-06-22 23:45] - Task: T-014 - Jest Unit & Integration Tests (Antigravity Orchestrator)
- **Summary**: Installed Jest, Supertest, and configured standard API and validation testing suites.
- **Technical Decisions**: Configured `jest.config.js` for App Router compatibility and Node test environment. Added unit tests for time/date/email validation helper functions. Developed integration tests invoking dynamic Next.js App Router API handlers directly with standard `NextRequest` and database fixtures.
- **Blockers & Fixes**: Fixed Prisma schema incompatibility where `ruangan` facilities were expecting a JSON-stringified string rather than an array.
- **Next Steps**: Start `T-015` (Cypress E2E Setup & Tests).
- **Commit**: `08c84b3`
