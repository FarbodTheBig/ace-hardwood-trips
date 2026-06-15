# ACE HARDWOOD — Driver Portal

A full-stack web app for Ace Hardwood truck drivers to fill out trip sheets, export PDFs, and view their history and analytics.

---

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth + PostgreSQL DB)
- **Tailwind CSS** (dark theme, brand orange)
- **Recharts** (analytics charts)
- **jsPDF + jspdf-autotable** (PDF export)

---

## Local Setup (Step by Step)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ace-hardwood-trips.git
cd ace-hardwood-trips
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Go to https://supabase.com and create a free account
2. Click **New Project** → give it a name (e.g. `ace-hardwood`)
3. Once created, go to **SQL Editor** in the sidebar
4. Copy and paste everything from `supabase-schema.sql` and click **Run**
5. Go to **Project Settings → API**
6. Copy your **Project URL** and **anon public** key

### 4. Create your `.env.local` file
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000 — you'll be redirected to the login page.

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ace-hardwood-trips.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project** → import your repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy**

That's it — your app is live!

---

## Features
- ✅ Sign up / Login (Supabase Auth with email confirmation)
- ✅ Driver dashboard with KM/week bar chart + top routes
- ✅ New trip sheet form (dynamic stops, auto KM + miles calculation)
- ✅ Save trip to your account history
- ✅ Browse past trips
- ✅ Export any trip as a clean PDF
- ✅ Print any trip sheet
- ✅ Driver name + company locked (can't be edited by mistake)
