# RoadLog — Driver Trip Management Platform

A full-stack SaaS web application built for truck drivers and fleet managers to digitize trip logging, document management, and dispatch operations.

**Live:** [ace-hardwood-trips-livid.vercel.app](https://ace-hardwood-trips-livid.vercel.app)

---

## Overview

RoadLog replaces paper-based driver trip sheets with a modern web platform. Drivers log 14-day period trip sheets, upload photos per stop, and export professional PDFs. Admins manage drivers, view all trips, assign loads, and export reports — all in real time.

---

## Features

### Driver Portal
- **14-Day Trip Sheets** — log all trips across a pay period on one sheet
- **Per-trip logging** — date, type, starting point, destination, trip #, trailer #, truck #
- **Photo uploads** — POD, PTI, and other documents per stop (up to 20 files each)
- **PDF export** — professional trip sheet matching industry standard format
- **KM tracking** — auto-calculates total KM and miles from start/end odometer
- **Trip history** — view and re-export all past sheets

### Admin Portal
- **Driver management** — create accounts, reset passwords, activate/deactivate drivers
- **All trips view** — search, filter, view photos, export PDFs, delete
- **Dispatch board** — driver status tracking and load assignment
- **Reports** — filter by driver/truck/date, summary table, CSV export
- **Messaging** — send notes to individual drivers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| Charts | Recharts |
| Deployment | Vercel |
| Language | TypeScript |

---

## Screenshots

> Driver login, dashboard, new trip sheet, admin portal

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/FarbodTheBig/ace-hardwood-trips.git
cd ace-hardwood-trips
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

Run the SQL in `supabase-schema.sql` in your Supabase SQL editor to create all required tables and storage buckets.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin portal pages
│   ├── auth/           # Login & signup
│   ├── dashboard/      # Driver dashboard
│   ├── history/        # Trip history
│   └── trip/           # New trip sheet
├── components/
│   ├── admin/          # Admin-specific components
│   ├── dashboard/      # Charts and stats
│   ├── trip/           # Trip form and photo upload
│   └── ui/             # Shared UI (sidebar, navbar)
├── lib/
│   ├── supabase/       # Supabase client/server setup
│   └── pdfGenerator.ts # PDF export logic
└── types/              # TypeScript interfaces
```

---

## Architecture

- **Auth** — Supabase Auth with separate driver and admin roles
- **Storage** — Supabase Storage for photo uploads organized by user/trip/stop/category
- **RLS** — Row Level Security policies ensure drivers only access their own data
- **PDF** — Client-side PDF generation matching industry standard trip sheet format
- **API Routes** — Server-side admin actions (create driver, reset password) using service role key

---

## Author

**Farbod Foroutani**  
Computer Science @ York University (Lassonde School of Engineering)  
[foroutani.net](https://foroutani.net) · [LinkedIn](https://linkedin.com/in/farbodforoutani)

---

## License

MIT
