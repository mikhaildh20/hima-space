# DESIGN — HIMA Space

> **UI/UX Design System Document**
> Versi: 1.0
> Tanggal: 22 Juni 2026
> Acuan: WIREFRAME v1.0

---

## 1. Overview

### 1.1 Design Principles

HIMA Space didesain dengan prinsip:

1. **Clarity** — Informasi mudah dipahami dalam 1 detik
2. **Consistency** — Setiap komponen遵循 pola yang sama
3. **Simplicity** — Minim clutter, fokus pada konten
4. **Accessibility** — Bisa diakses semua user tanpa hambatan
5. **Responsiveness** — Berfungsi optimal di semua device

### 1.2 Design Token Summary

| Token | Value | Kegunaan |
|-------|-------|---------|
| Primary Color | `#3b82f6` | Tombol, link, interactive elements |
| Background | `#f9fafb` | Halaman utama |
| Text Primary | `#111827` | Konten utama |
| Border Radius | `0.5rem` | Cards, buttons, inputs |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` | Cards, elevated elements |
| Spacing Unit | `0.25rem` (4px) | Consistent spacing |

---

## 2. Color Palette

### 2.1 Primary Colors

```
PRIMARY
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Blue 50         │ Blue 500        │ Blue 600        │ Blue 700        │
│ #eff6ff         │ #3b82f6         │ #2563eb         │ #1d4ed8         │
│                 │                 │                 │                 │
│ Light bg        │ Default         │ Hover           │ Active          │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Usage:**
- `#3b82f6` → Primary buttons, links, active states
- `#2563eb` → Hover state, focus ring
- `#1d4ed8` → Active/pressed state
- `#eff6ff` → Light backgrounds, badges

### 2.2 Status Colors

```
STATUS
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Green 500       │ Green 600       │ Yellow 500      │ Yellow 600      │
│ #22c55e         │ #16a34a         │ #eab308         │ #ca8a04         │
│                 │                 │                 │                 │
│ Approved/Success│ Hover           │ Pending/Warning │ Hover           │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Red 500         │ Red 600         │ Gray 500        │ Gray 600        │
│ #ef4444         │ #dc2626         │ #6b7280         │ #4b5563         │
│                 │                 │                 │                 │
│ Rejected/Error  │ Hover           │ Cancelled       │ Hover           │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Color Semantics:**

| Status | Background | Text | Border | Kegunaan |
|--------|-----------|------|--------|----------|
| Approved | `#dcfce7` | `#166534` | `#86efac` | Badge, calendar event |
| Pending | `#fef9c3` | `#854d0e` | `#fde047` | Badge, calendar event |
| Rejected | `#fee2e2` | `#991b1b` | `#fca5a5` | Badge, calendar event |
| Cancelled | `#f3f4f6` | `#374151` | `#d1d5db` | Badge, calendar event |
| Active/Success | `#f0fdf4` | `#166534` | `#86efac` | Success toast |
| Error | `#fef2f2` | `#991b1b` | `#fca5a5` | Error message |

### 2.3 Neutral Colors

```
NEUTRALS
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Gray 50         │ Gray 100        │ Gray 200        │ Gray 300        │
│ #f9fafb         │ #f3f4f6         │ #e5e7eb         │ #d1d5db         │
│                 │                 │                 │                 │
│ Page background │ Card background │ Borders         │ Disabled bg     │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Gray 400        │ Gray 500        │ Gray 600        │ Gray 700        │
│ #9ca3af         │ #6b7280         │ #4b5563         │ #374151         │
│                 │                 │                 │                 │
│ Placeholder     │ Secondary text  │ Hover text      │ Muted text      │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┐
│ Gray 800        │ Gray 900        │
│ #1f2937         │ #111827         │
│                 │                 │
│ Headings        │ Primary text    │
│                 │                 │
└─────────────────┴─────────────────┘
```

### 2.4 Semantic Colors

| Usage | Color | Hex | Contoh |
|-------|-------|-----|--------|
| **Info** | Blue 500 | `#3b82f6` | Info tooltips |
| **Success** | Green 500 | `#22c55e` | Success toasts |
| **Warning** | Yellow 500 | `#eab308` | Warning banners |
| **Error** | Red 500 | `#ef4444` | Error messages |
| **Neutral** | Gray 500 | `#6b7280` | Disabled states |

---

## 3. Typography

### 3.1 Font Stack

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Fallback System Fonts */
font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Monospace (for code) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Type Scale

```
TYPE SCALE
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Display (24px)      H1 — Page title                          │
│  ═══════════════                                                │
│  Semibold (700)      Color: Gray 900 (#111827)                │
│  Line-height: 1.3    Margin-bottom: 1rem                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Heading (20px)      H2 — Section header                      │
│  ──────────────────                                            │
│  Semibold (600)      Color: Gray 900 (#111827)                │
│  Line-height: 1.4    Margin-bottom: 0.75rem                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Subheading (16px)   H3 — Card title                          │
│  ─────────────────                                             │
│  Semibold (600)      Color: Gray 900 (#111827)                │
│  Line-height: 1.5    Margin-bottom: 0.5rem                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Body (14px)         Default text                             │
│  ─────────────                                                 │
│  Regular (400)       Color: Gray 900 (#111827)                │
│  Line-height: 1.6    Margin-bottom: 0.25rem                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Small (12px)        Captions, metadata                       │
│  ──────────────                                                │
│  Regular (400)       Color: Gray 500 (#6b7280)                │
│  Line-height: 1.4    Margin-bottom: 0                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Badge (12px)        Status badges, counts                    │
│  ─────────────                                                 │
│  Medium (500)        Color: Varies                            │
│  Line-height: 1.0    Text-transform: uppercase                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Button (14px)       Button text                              │
│  ──────────────                                                │
│  Medium (500)        Color: White (on primary)                │
│  Line-height: 1.0    Text-transform: none                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Type Styles

| Style | Size | Weight | Line Height | Color | Example |
|-------|------|--------|-------------|-------|---------|
| Display | 24px | 700 | 1.3 | #111827 | "Dashboard" |
| H1 | 20px | 600 | 1.4 | #111827 | "Kelola Ruangan" |
| H2 | 16px | 600 | 1.5 | #111827 | "Booking Hari Ini" |
| Body | 14px | 400 | 1.6 | #111827 | Deskripsi, konten |
| Small | 12px | 400 | 1.4 | #6b7280 | Tanggal, metadata |
| Badge | 12px | 500 | 1.0 | Varies | "PENDING", "APPROVED" |
| Button | 14px | 500 | 1.0 | #ffffff | "Booking Baru" |

---

## 4. Spacing System

### 4.1 Base Unit

```
Base unit: 4px (0.25rem)
```

### 4.2 Spacing Scale

| Token | Value | Pixels | Kegunaan |
|-------|-------|--------|----------|
| `space-0` | 0 | 0px | No spacing |
| `space-1` | 0.25rem | 4px | Tight spacing |
| `space-2` | 0.5rem | 8px | Default spacing |
| `space-3` | 0.75rem | 12px | Medium spacing |
| `space-4` | 1rem | 16px | Standard spacing |
| `space-5` | 1.25rem | 20px | Large spacing |
| `space-6` | 1.5rem | 24px | Section spacing |
| `space-8` | 2rem | 32px | Card spacing |
| `space-10` | 2.5rem | 40px | Page spacing |
| `space-12` | 3rem | 48px | Major sections |

### 4.3 Spacing Guidelines

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Card                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ space-6                                                  │   │
│  │ ┌───────────────────────────────────────────────────┐   │   │
│  │ │ Title: space-4 (padding-bottom)                    │   │   │
│  │ ├───────────────────────────────────────────────────┤   │   │
│  │ │ Content: space-2 between items                     │   │   │
│  │ ├───────────────────────────────────────────────────┤   │   │
│  │ │ Footer: space-4 (padding-top)                      │   │   │
│  │ └───────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Page                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ space-8 (page padding)                                  │   │
│  │ ┌─────────────────────────────────────────────────┐     │   │
│  │ │ space-6 between cards                           │     │   │
│  │ └─────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Component System

### 5.1 Buttons

**Primary Button:**
```
┌─────────────────────────────┐
│                             │
│    Booking Baru             │  ← White text on primary bg
│                             │
└─────────────────────────────┘

States:
- Default: bg-blue-500, text-white
- Hover: bg-blue-600, text-white
- Active: bg-blue-700, text-white
- Disabled: bg-blue-300, text-white, opacity-0.5
```

**Secondary Button:**
```
┌─────────────────────────────┐
│                             │
│       Kembali               │  ← Blue text, white bg, blue border
│                             │
└─────────────────────────────┘

States:
- Default: bg-white, border-blue-500, text-blue-500
- Hover: bg-blue-50, border-blue-600
- Active: bg-blue-100, border-blue-700
- Disabled: bg-gray-100, border-gray-300, text-gray-400
```

**Success Button:**
```
┌─────────────────────────────┐
│                             │
│      ✅ Approve             │  ← White text on green bg
│                             │
└─────────────────────────────┘

States:
- Default: bg-green-500, text-white
- Hover: bg-green-600, text-white
```

**Danger Button:**
```
┌─────────────────────────────┐
│                             │
│      ❌ Reject              │  ← White text on red bg
│                             │
└─────────────────────────────┘

States:
- Default: bg-red-500, text-white
- Hover: bg-red-600, text-white
```

**Ghost Button:**
```
┌─────────────────────────────┐
│                             │
│    Lihat Detail →           │  ← No bg, blue text
│                             │
└─────────────────────────────┘

States:
- Default: bg-transparent, text-blue-500
- Hover: bg-blue-50, text-blue-600
```

**Button Sizes:**
| Size | Padding | Font Size | Contoh |
|------|---------|-----------|--------|
| Small | 0.375rem 0.75rem | 12px | "Lihat Detail" |
| Medium | 0.5rem 1rem | 14px | "Booking Baru" |
| Large | 0.75rem 1.5rem | 16px | "Submit" |

---

### 5.2 Form Inputs

**Text Input:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Nama Ruangan *                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Ruang HIMA                                              │   │  ← Border abu-abu
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

States:
- Default: border-gray-300, bg-white
- Focus: border-blue-500, ring-blue-500, shadow
- Error: border-red-500, bg-red-50
- Success: border-green-500, bg-green-50
- Disabled: border-gray-200, bg-gray-100
```

**Input States:**
```
Normal:        ┌────────────────────────────────┐
               │ Placeholder text              │  ← border-gray-300
               └────────────────────────────────┘

Focus:         ┌────────────────────────────────┐
               │ Cursor here                   │  ← border-blue-500, shadow
               └────────────────────────────────┘

Error:         ┌────────────────────────────────┐
               │ Invalid input                 │  ← border-red-500, bg-red-50
               └────────────────────────────────┘
               ❌ Error message here            ← text-red-600

Success:       ┌────────────────────────────────┐
               │ Valid input                    │  ← border-green-500
               └────────────────────────────────┘

Disabled:      ┌────────────────────────────────┐
               │ Cannot edit                    │  ← bg-gray-100, no border
               └────────────────────────────────┘
```

**Select Dropdown:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Ruangan *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▾ Pilih Ruangan                                      ▾  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

States:
- Default: border-gray-300, bg-white
- Focus: border-blue-500
- Open: Dropdown appears below
- Selected: Shows selected option
```

**Date Input:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Tanggal *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📅 25 Juni 2026                                         │   │  ← border-gray-300
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Time Input:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Jam Mulai *                                                    │
│  ┌────────────────────────────────────┐  ┌──────────────────┐   │
│  │ 🕐 13:00                          │  │ Jam Selesai *    │   │
│  └────────────────────────────────────┘  │ 🕐 15:00        │   │
│                                          └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Status Badges

**Badge Variants:**
```
PENDING (Yellow)
┌─────────────────┐
│ PENDING         │  ← bg-yellow-100, text-yellow-800, border-yellow-300
└─────────────────┘

APPROVED (Green)
┌─────────────────┐
│ APPROVED        │  ← bg-green-100, text-green-800, border-green-300
└─────────────────┘

REJECTED (Red)
┌─────────────────┐
│ REJECTED        │  ← bg-red-100, text-red-800, border-red-300
└─────────────────┘

CANCELLED (Gray)
┌─────────────────┐
│ CANCELLED       │  ← bg-gray-100, text-gray-800, border-gray-300
└─────────────────┘
```

**Badge Sizes:**
| Size | Padding | Font Size | Example |
|------|---------|-----------|---------|
| Small | 0.125rem 0.375rem | 10px | Inline |
| Medium | 0.25rem 0.5rem | 12px | Default |
| Large | 0.375rem 0.75rem | 14px | Header |

---

### 5.4 Cards

**Stat Card (Dashboard):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📅                                                      │   │
│  │                                                          │   │
│  │  8                                                      │   │  ← text-3xl font-bold
│  │  Booking Hari Ini                                        │   │  ← text-gray-600
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: white
- border: 1px solid #e5e7eb
- border-radius: 0.5rem
- shadow: 0 1px 3px rgba(0,0,0,0.1)
- padding: 1.5rem
```

**Booking Card:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🟢 APPROVED                                      13:00  │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  Rapat Pengurus HIMA                                      │   │
│  │  📍 Ruang HIMA │ 📅 25 Jun 2026                          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                   [ Lihat Detail ] [Cancel]│  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: white
- border: 1px solid #e5e7eb
- border-radius: 0.5rem
- shadow: 0 1px 3px rgba(0,0,0,0.1)
- padding: 1rem
- status bar: 4px solid left border with status color
```

---

### 5.5 Tables

**Table Header:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  #  │ Judul          │ Ruangan   │ Tanggal   │ Waktu    │ Aksi │
│  ───┼────────────────┼───────────┼───────────┼──────────┼──────│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: #f3f4f6 (gray-100)
- font: text-sm font-semibold text-gray-600
- border-bottom: 2px solid #e5e7eb
```

**Table Row:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1  │ Rapat Pengurus │ HIMA      │ 25 Jun    │ 13:00-15 │ [View]│
│  ───┼────────────────┼───────────┼───────────┼──────────┼──────│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: white
- hover: bg-gray-50
- border-bottom: 1px solid #e5e7eb
- padding: 0.75rem 1rem
```

---

### 5.6 Modal

**Modal Container:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │  ← Overlay (bg-black/50)
│         ┌────────────────────────────────────────┐             │
│         │  Modal Title                      [X]  │             │
│         ├────────────────────────────────────────┤             │
│         │                                        │             │
│         │           CONTENT AREA                 │             │
│         │                                        │             │
│         │                                        │             │
│         ├────────────────────────────────────────┤             │
│         │      [ Cancel ]      [ Confirm ]       │             │
│         └────────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Modal Styles:
- Container: bg-white, border-radius: 0.75rem, shadow: 0 25px 50px rgba(0,0,0,0.25)
- Width: max-width 500px
- Overlay: bg-black/50
- Header: border-bottom, padding: 1.5rem
- Content: padding: 1.5rem
- Footer: border-top, padding: 1rem 1.5rem, flex justify-end gap-3
```

---

### 5.7 Alerts & Toasts

**Success Toast:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ✅ Booking berhasil dibuat!                                   │  ← bg-green-100
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: #dcfce7 (green-100)
- border: 1px solid #86efac (green-300)
- border-radius: 0.5rem
- padding: 1rem 1.25rem
- text: #166534 (green-900)
```

**Error Toast:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ❌ Ruangan sudah dibooking pada waktu tersebut                 │  ← bg-red-100
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: #fee2e2 (red-100)
- border: 1px solid #fca5a5 (red-300)
- border-radius: 0.5rem
- padding: 1rem 1.25rem
- text: #991b1b (red-900)
```

**Warning Toast:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ⚠️ Jam selesai harus lebih besar dari jam mulai                │  ← bg-yellow-100
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Styles:
- bg: #fef9c3 (yellow-100)
- border: 1px solid #fde047 (yellow-300)
- border-radius: 0.5rem
- padding: 1rem 1.25rem
- text: #854d0e (yellow-900)
```

---

## 6. Iconography

### 6.1 Icon Library

Gunakan **Lucide Icons** (open source, konsisten):

| Kategori | Icons | Kegunaan |
|----------|-------|---------|
| Navigation | `calendar`, `home`, `clipboard-list`, `settings` | Sidebar, navbar |
| Actions | `plus`, `edit`, `trash-2`, `check`, `x` | CRUD actions |
| Status | `clock`, `check-circle`, `x-circle`, `alert-circle` | Status indicators |
| Info | `info`, `help-circle`, `external-link`, `download` | Information |
| UI | `chevron-down`, `chevron-left`, `chevron-right`, `search` | UI controls |
| Social | `user`, `users`, `building`, `mail` | People, orgs |

### 6.2 Icon Sizes

| Size | Pixels | Kegunaan | Example |
|------|--------|----------|---------|
| Small | 16px | Inline text, badges | Status icon di badge |
| Medium | 20px | Default | Tombol, navigation |
| Large | 24px | Headers, stats | Stat cards |
| XLarge | 32px | Hero, prominent | Empty states |

### 6.3 Icon Colors

| Context | Color | Hex |
|---------|-------|-----|
| Default | Gray 500 | `#6b7280` |
| Active/Selected | Blue 500 | `#3b82f6` |
| Success | Green 500 | `#22c55e` |
| Warning | Yellow 500 | `#eab308` |
| Error | Red 500 | `#ef4444` |
| On primary button | White | `#ffffff` |

---

## 7. Layout & Grid System

### 7.1 Grid System

```
Desktop (>=1024px):
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────┬─────────────────────────────────────────────────────┐   │
│ │     │                                                     │   │
│ │ 240 │                   100% width                       │   │
│ │ px  │                   Main Content                     │   │
│ │     │                                                     │   │
│ │Sidebar│                                                   │   │
│ └─────┴─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Tablet (768-1023px):
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────┬────────────────────────────────────────────────────┐   │
│ │      │                                                    │   │
│ │ 64px │                   100% width                       │   │
│ │      │                   Main Content                     │   │
│ │icons │                                                    │   │
│ │only  │                                                    │   │
│ └──────┴────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────┐   │
│ │                   100% width                             │   │
│ │                   Main Content                           │   │
│ │                   (Sidebar hidden)                       │   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ [≡] HIMA Space                                    [👤]   │  │ ← Mobile nav
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Max Width Container

| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile | 100% | 1rem |
| Tablet | 768px | 1.5rem |
| Desktop | 1024px | 2rem |
| Large | 1280px | 2rem |

### 7.3 Card Grid

```
Dashboard Stat Cards:
┌─────────────────────────────────────────────────────────────────┐
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]                       │
└─────────────────────────────────────────────────────────────────┘

- Gap: 1.5rem (24px)
- Responsive:
  - Desktop: 4 columns
  - Tablet: 2 columns
  - Mobile: 1 column (stacked)
```

---

## 8. Interactive States

### 8.1 Focus States

```
Focus Ring:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────── [focus ring] ───────┐                                │
│  │                            │                                │
│  │  Button Text               │  ← outline: 2px solid #3b82f6 │
│  │                            │     outline-offset: 2px        │
│  └────────────────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Focus Ring Styles:**
- `outline: 2px solid #3b82f6`
- `outline-offset: 2px`
- Applied on: buttons, inputs, links, any interactive element
- Remove on: `:focus:not(:focus-visible)` for mouse users

### 8.2 Hover States

**Interactive Elements:**
| Element | Default | Hover | Active |
|---------|---------|-------|--------|
| Button Primary | bg-blue-500 | bg-blue-600 | bg-blue-700 |
| Button Secondary | border-blue-500 | border-blue-600 | border-blue-700 |
| Link | text-blue-500 | text-blue-600, underline | text-blue-700 |
| Card | shadow-sm | shadow-md | shadow-lg |
| Table Row | bg-white | bg-gray-50 | bg-gray-100 |
| Badge | — | opacity-90 | opacity-80 |

### 8.3 Loading States

**Spinner:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ╭──────────╮                                │
│                    │  ╭────╮  │                                │
│                    │  │ ○ │  │  ← Rotating animation          │
│                    │  ╰────╯  │                                │
│                    ╰──────────╯                                │
│                                                                 │
│                    Loading data...                             │  ← Gray text
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Skeleton Loading:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ████████████  ← shimmer animation (gray-200 → gray-100)│   │
│  │                                                          │   │
│  │  ██████████████████████████                              │   │
│  │                                                          │   │
│  │  ████████████████                                        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Animation: shimmer effect, 1.5s infinite
Colors: bg-gray-200 → bg-gray-100 → bg-gray-200
```

### 8.4 Empty States

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         📭                                      │  ← Icon (64px)
│                                                                 │
│                    Belum ada booking                            │  ← text-lg font-semibold
│                                                                 │
│        Anda belum membuat booking apapun.                       │  ← text-sm text-gray-600
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                + Booking Baru                           │   │  ← Primary button
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Responsive Design

### 9.1 Breakpoints

| Breakpoint | Width | Sidebar | Navigation | Cards |
|------------|-------|---------|-----------|-------|
| Mobile | < 768px | Hidden (toggle menu) | Bottom nav / hamburger | 1 column |
| Tablet | 768-1023px | Collapsed (icons only) | Sidebar visible | 2 columns |
| Desktop | >= 1024px | Full width (240px) | Full sidebar | 4 columns |
| Large | >= 1280px | Full width | Full sidebar | 4 columns |

### 9.2 Mobile Adaptations

**Calendar View:**
```
Mobile Calendar:
┌─────────────────────────────┐
│ ◄  Juni 2026  ►            │
├─────┬─────┬─────┬─────┬─────┤
│ Min │ Sen │ Sel │ Rab │ ... │
├─────┼─────┼─────┼─────┼─────┤
│     │     │     │  1  │     │
├─────┼─────┼─────┼─────┼─────┤
│  3  │  4  │  5  │  6  │     │
│     │ 🟢  │     │     │     │  ← Event dots instead of cards
├─────┼─────┼─────┼─────┼─────┤
└─────────────────────────────┘
```

**Form Layout:**
```
Mobile Form:
┌─────────────────────────────┐
│                             │
│  Label                      │
│  ┌─────────────────────────┐│
│  │ Input                   ││  ← Full width
│  └─────────────────────────┘│
│                             │
│  Label                      │
│  ┌─────────────────────────┐│
│  │ Input                   ││  ← Full width
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │      Submit Button      ││  ← Full width
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

### 9.3 Typography Scaling

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Display | 20px | 22px | 24px |
| H1 | 18px | 20px | 20px |
| H2 | 16px | 18px | 18px |
| Body | 14px | 14px | 14px |
| Small | 12px | 12px | 12px |

---

## 10. Accessibility (a11y)

### 10.1 Color Contrast

**WCAG 2.1 Level AA Compliance:**

| Element | Foreground | Background | Contrast Ratio | Status |
|---------|-----------|------------|----------------|--------|
| Body Text | #111827 | #ffffff | 15.4:1 | ✅ Pass |
| Secondary Text | #6b7280 | #ffffff | 5.9:1 | ✅ Pass |
| Primary Button | #ffffff | #3b82f6 | 4.6:1 | ✅ Pass |
| Success Text | #166534 | #dcfce7 | 6.9:1 | ✅ Pass |
| Error Text | #991b1b | #fee2e2 | 7.1:1 | ✅ Pass |
| Link | #3b82f6 | #ffffff | 4.6:1 | ✅ Pass |
| Placeholder | #9ca3af | #ffffff | 3.5:1 | ⚠️ Needs darker |

**Fix:** Change placeholder color to `#6b7280` (gray-500) for 5.9:1 ratio.

### 10.2 Focus Indicators

```
Required:
- Visible focus ring on all interactive elements
- Focus ring: 2px solid #3b82f6
- Focus ring offset: 2px
- High contrast mode: 3px solid #000000
```

### 10.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move to next interactive element |
| Shift+Tab | Move to previous element |
| Enter | Activate button/link |
| Space | Toggle checkbox/button |
| Escape | Close modal |
| Arrow keys | Navigate within calendar |
| Home/End | Jump to first/last day in month |

### 10.4 Screen Reader Support

**Semantic HTML:**
```html
<!-- Use semantic elements -->
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>

<!-- Landmarks -->
<div role="region" aria-label="Calendar">...</div>
<div role="alert" aria-live="polite">...</div>
```

**ARIA Attributes:**
```html
<!-- Buttons with icons -->
<button aria-label="Booking baru" aria-describedby="tooltip-booking">
  <Icon name="plus" aria-hidden="true" />
</button>

<!-- Status badges -->
<span role="status" aria-label="Status: Pending" class="badge">
  PENDING
</span>

<!-- Calendar events -->
<div role="button" aria-label="Booking: Rapat Pengurus, 13:00-15:00, Approved">
  Rapat Pengurus
</div>
```

### 10.5 Alt Text

| Element | Alt Text |
|---------|----------|
| Logo | "HIMA Space Logo" |
| User Avatar | "Avatar pengguna: [Nama]" |
| Status Badge | "Status: [Status]" |
| Calendar Event | "Booking: [Judul], [Waktu], [Status]" |

### 10.6 Motion & Animation

**Reduced Motion Preference:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

**Safe Animations:**
- Fade in/out (opacity)
- Scale (transform)
- Slide (transform: translateY)

**Avoid:**
- Parallax scrolling
- Auto-playing carousels
- Flashing animations

---

## 11. Dark Mode (Optional - v2)

### 11.1 Dark Palette

| Token | Light | Dark |
|-------|-------|------|
| Background | `#f9fafb` | `#111827` |
| Surface | `#ffffff` | `#1f2937` |
| Border | `#e5e7eb` | `#374151` |
| Text Primary | `#111827` | `#f9fafb` |
| Text Secondary | `#6b7280` | `#9ca3af` |
| Primary | `#3b82f6` | `#60a5fa` |

### 11.2 Implementation

```css
:root {
  --bg-primary: #f9fafb;
  --text-primary: #111827;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #f9fafb;
    /* ... */
  }
}
```

---

## 12. CSS Implementation

### 12.1 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
```

### 12.2 Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900 bg-gray-50;
  }

  h1 { @apply text-2xl font-semibold; }
  h2 { @apply text-xl font-semibold; }
  h3 { @apply text-lg font-semibold; }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white px-4 py-2 rounded-lg
           hover:bg-primary-600 active:bg-primary-700
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:ring-offset-2 disabled:opacity-50
           transition-colors duration-150;
  }

  .btn-secondary {
    @apply border border-primary-500 text-primary-500 px-4 py-2
           rounded-lg hover:bg-primary-50 active:bg-primary-100
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:ring-offset-2 disabled:opacity-50
           transition-colors duration-150;
  }

  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:border-primary-500 disabled:bg-gray-100
           transition-colors duration-150;
  }

  .card {
    @apply bg-white border border-gray-200 rounded-lg
           shadow-card p-6;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full
           text-xs font-medium;
  }

  .badge-pending {
    @apply bg-yellow-100 text-yellow-800 border border-yellow-300;
  }

  .badge-approved {
    @apply bg-green-100 text-green-800 border border-green-300;
  }

  .badge-rejected {
    @apply bg-red-100 text-red-800 border border-red-300;
  }

  .badge-cancelled {
    @apply bg-gray-100 text-gray-800 border border-gray-300;
  }
}
```

---

## 13. Design Checklist

### 13.1 Before Development

- [ ] All colors defined with exact hex values
- [ ] Typography scale documented
- [ ] Spacing system defined
- [ ] Component states documented (default, hover, focus, active, disabled)
- [ ] Responsive breakpoints defined
- [ ] Icon library selected
- [ ] Accessibility guidelines included

### 13.2 During Development

- [ ] Use design tokens consistently
- [ ] Implement all component states
- [ ] Test keyboard navigation
- [ ] Verify color contrast
- [ ] Test on multiple devices
- [ ] Follow responsive breakpoints

### 13.3 After Development

- [ ] Visual review on all breakpoints
- [ ] Accessibility audit (axe, Lighthouse)
- [ ] Cross-browser testing
- [ ] Screen reader testing
- [ ] Performance check (no layout shifts)

---

*Dokumen ini mendefinisikan design system HIMA Space. Semua implementasi UI harus mengacu pada dokumen ini untuk menjaga konsistensi visual.*
