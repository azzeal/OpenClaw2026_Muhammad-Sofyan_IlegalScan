# ClearMark — Deteksi Produk Palsu di E-commerce Indonesia

> Sistem otomatis untuk memantau dan mendeteksi listing produk palsu/ilegal di marketplace Indonesia (Shopee, Tokopedia, TikTok Shop). Dibangun untuk kompetisi **OpenClaw 2026**.

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Arsitektur](#arsitektur)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Siapkan PostgreSQL](#2-siapkan-postgresql)
  - [3. Jalankan Platform (port 3001)](#3-jalankan-platform-port-3001)
  - [4. Jalankan Dashboard Mission Control (port 3000)](#4-jalankan-dashboard-mission-control-port-3000)
- [Cara Pengujian](#cara-pengujian)
  - [Skenario 1 — Registrasi Brand Baru + Tambah Produk](#skenario-1--registrasi-brand-baru--tambah-produk)
  - [Skenario 2 — Login Demo + Jalankan Scan](#skenario-2--login-demo--jalankan-scan)
  - [Skenario 3 — Lihat Mission Control](#skenario-3--lihat-mission-control)
- [Akun Demo](#akun-demo)
- [Tech Stack](#tech-stack)
- [Struktur Repository](#struktur-repository)
- [API Routes](#api-routes)
- [Lisensi](#lisensi)

---

## Gambaran Umum

**ClearMark** adalah platform SaaS multi-tenant yang memungkinkan pemilik brand mendaftarkan produk mereka untuk dipantau secara otomatis terhadap penjualan palsu/ilegal di marketplace Indonesia.

Sistem terdiri dari **dua aplikasi**:

| Aplikasi | Port | Deskripsi |
|---|---|---|
| **ClearMark Platform** | `3001` | Aplikasi SaaS untuk klien (pemilik brand). Registrasi, login, kelola produk, jalankan scan, lihat temuan. |
| **Mission Control Dashboard** | `3000` | Dashboard internal untuk operator. Menampilkan status agen AI (Scanner, Intake, Analyst), proyek, pola deteksi, dan jurnal. |

### Fitur Utama

- **Multi-tenant auth** — setiap brand mendapat tenant terisolasi, semua data difilter per tenant
- **Registrasi & onboarding** — buat akun → buat tenant → tambah produk yang ingin dipantau
- **Scraper marketplace** — HTTP scraper untuk Shopee, Tokopedia, dan TikTok Shop
- **Deteksi kemiripan** — pencocokan teks (keyword + Jaccard similarity) untuk menilai apakah listing mencurigakan
- **Dashboard temuan** — lihat semua listing yang terdeteksi, dengan skor kemiripan dan status
- **Scan manual & otomatis** — tombol scan instan + jadwal Vercel Cron setiap 6 jam
- **Mission Control** — dashboard internal berbasis filesystem dengan indeks pencarian SQLite FTS5

---

## Arsitektur

```
┌───────────────────────────────────────────────────────────┐
│                     Repository Root                        │
├──────────────────┬──────────────────┬─────────────────────┤
│    platform/     │    dashboard/    │    clearmark/        │
│  (Next.js 15)    │  (Next.js 15)    │  (Data filesystem)  │
│  Port 3001       │  Port 3000       │                     │
│                  │                  │  agents/             │
│  PostgreSQL ◄────┤  SQLite FTS5 ◄───┤  memory/patterns/   │
│  (Drizzle ORM)   │  (better-sqlite3)│  memory/journal/    │
│                  │                  │  projects/           │
│  Auth.js (JWT)   │                  │  inbox/              │
│  Scrapers (HTTP) │                  │                     │
└──────────────────┴──────────────────┴─────────────────────┘
```

---

## Prasyarat

Pastikan software berikut sudah terinstal:

| Software | Versi Minimum | Cara Cek |
|---|---|---|
| **Node.js** | 22.x | `node -v` |
| **npm** | 10.x | `npm -v` |
| **PostgreSQL** | 14+ | `psql --version` |

> **Catatan untuk Ubuntu/Debian:**
> ```bash
> # Install Node.js 22 (jika belum ada)
> curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
> sudo apt install -y nodejs
>
> # Install PostgreSQL
> sudo apt install -y postgresql postgresql-client
> ```

---

## Instalasi & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/azzeal/OpenClaw2026_Muhammad-Sofyan_IlegalScan.git
cd OpenClaw2026_Muhammad-Sofyan_IlegalScan
```

### 2. Siapkan PostgreSQL

Pastikan PostgreSQL berjalan, lalu buat user dan database:

```bash
# Jalankan PostgreSQL (Linux)
sudo pg_ctlcluster 16 main start
# Atau: sudo systemctl start postgresql

# Buat user dan database
sudo -u postgres psql -c "CREATE USER clearmark WITH PASSWORD 'clearmark';"
sudo -u postgres psql -c "CREATE DATABASE clearmark_platform OWNER clearmark;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE clearmark_platform TO clearmark;"
```

> **Verifikasi koneksi:**
> ```bash
> psql "postgres://clearmark:clearmark@localhost:5432/clearmark_platform" -c "SELECT 1;"
> ```
> Jika berhasil, akan menampilkan `1`.

### 3. Jalankan Platform (port 3001)

```bash
cd platform

# Buat file environment
cp .env.example .env.local
```

Edit file `platform/.env.local` — isi minimal yang diperlukan:

```env
DATABASE_URL="postgres://clearmark:clearmark@localhost:5432/clearmark_platform"
AUTH_SECRET="ganti-dengan-string-acak-32-karakter"
NEXTAUTH_URL="http://localhost:3001"
CRON_SECRET="ganti-dengan-string-acak-untuk-cron"
```

> **Tip:** Untuk generate `AUTH_SECRET` secara acak:
> ```bash
> openssl rand -base64 32
> ```

Lanjutkan instalasi:

```bash
# Install dependencies
npm install

# Buat tabel di database
npx drizzle-kit push --force

# Isi data demo (opsional, tapi direkomendasikan untuk pengujian)
npm run db:seed

# Jalankan server development
npm run dev
```

Buka **http://localhost:3001** di browser. Anda akan melihat halaman landing ClearMark.

### 4. Jalankan Dashboard Mission Control (port 3000)

Buka terminal baru:

```bash
cd dashboard

# Install dependencies
npm install

# Bangun indeks pencarian dari data filesystem
npm run index

# Jalankan server development
npm run dev
```

Buka **http://localhost:3000** di browser. Anda akan melihat dashboard Mission Control dengan tema gelap.

---

## Cara Pengujian

### Skenario 1 — Registrasi Brand Baru + Tambah Produk

1. Buka **http://localhost:3001/register**
2. Isi form:
   - **Nama kamu:** `Juri OpenClaw`
   - **Nama brand:** `Brand Juri`
   - **Email kerja:** `juri@test.local`
   - **Password:** `password123`
3. Klik **Daftar & mulai trial** — akan otomatis login dan masuk ke halaman onboarding
4. Di halaman onboarding, tambahkan produk pertama yang ingin dipantau
5. Klik **Simpan** — akan redirect ke dashboard
6. Di dashboard, Anda akan melihat:
   - 1 produk terpantau
   - Statistik scan (belum ada data scan)
7. Navigasi ke **Produk** di sidebar untuk melihat daftar produk

### Skenario 2 — Login Demo + Jalankan Scan

1. Buka **http://localhost:3001/login**
2. Login dengan akun demo:
   - **Email:** `demo@clearmark.local`
   - **Password:** `demo12345`
3. Setelah masuk ke dashboard, navigasi ke **Settings** (Pengaturan)
4. Di kartu **Scan manual**, klik **Jalankan scan sekarang**
5. Scan akan berjalan terhadap 3 marketplace (Shopee, Tokopedia, TikTok Shop) untuk setiap produk
6. Setelah scan selesai, navigasi ke:
   - **Dashboard** — lihat statistik temuan terbaru
   - **Temuan** — lihat daftar listing yang terdeteksi
   - **Settings** — lihat riwayat scan di bagian bawah halaman

> **Catatan:** Hasil scan bergantung pada ketersediaan marketplace saat pengujian.
> Beberapa marketplace mungkin memblokir request (status `blocked`). Ini normal —
> scraper menggunakan HTTP langsung tanpa proxy berbayar.

### Skenario 3 — Lihat Mission Control

1. Buka **http://localhost:3000** (pastikan dashboard sudah berjalan)
2. Anda akan melihat:
   - **3 agen** (Scanner, Intake, Analyst) dengan status masing-masing
   - **1 proyek aktif** (Pfizer Indonesia) dengan data contoh
   - **4 pola deteksi** (pattern) yang sudah dipelajari
   - **1 hari jurnal** dengan catatan operasional

---

## Akun Demo

Setelah menjalankan `npm run db:seed`, akun demo berikut tersedia:

| Email | Password | Brand | Produk |
|---|---|---|---|
| `demo@clearmark.local` | `demo12345` | Demo Brand | 3 produk (Serum, Moisturizer, Sunscreen) |

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4 |
| Backend | Next.js API Routes (serverless) |
| Database (Platform) | PostgreSQL + Drizzle ORM |
| Database (Dashboard) | SQLite FTS5 (better-sqlite3) — indeks pencarian dari filesystem |
| Auth | Auth.js (NextAuth v5) dengan JWT |
| Scraper | HTTP scraper (Cheerio) untuk Shopee, Tokopedia, TikTok Shop |
| Similarity | Pencocokan teks (Jaccard + keyword matching) |

---

## Struktur Repository

```
.
├── platform/               # Aplikasi SaaS untuk klien (port 3001)
│   ├── app/
│   │   ├── (auth)/          # Halaman login & register
│   │   ├── (marketing)/     # Landing page & pricing
│   │   ├── (app)/           # Dashboard (auth required)
│   │   └── api/             # API routes (register, products, scan, cron)
│   ├── lib/
│   │   ├── db/              # Drizzle schema & koneksi
│   │   ├── scrapers/        # HTTP scraper per marketplace
│   │   ├── scan/            # Engine scan (run + match)
│   │   └── similarity/      # Algoritma kemiripan teks & gambar
│   ├── components/          # React components (UI kit)
│   ├── scripts/seed.ts      # Script seed data demo
│   └── .env.example         # Template environment variables
│
├── dashboard/               # Mission Control internal (port 3000)
│   ├── app/                 # Halaman dashboard
│   ├── lib/                 # Reader data filesystem + paths
│   └── scripts/             # Script build indeks SQLite
│
├── clearmark/               # Data layer (filesystem)
│   ├── agents/              # State agen (Scanner, Intake, Analyst)
│   ├── projects/            # Data proyek klien
│   ├── memory/
│   │   ├── patterns/        # Pola deteksi yang dipelajari
│   │   └── journal/         # Catatan harian operasional
│   └── inbox/               # Request masuk dari klien
│
└── skills/                  # Definisi skill agen AI
    ├── clearmark-scanner/
    ├── clearmark-intake/
    └── clearmark-analyst/
```

---

## API Routes

| Method | Route | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/` | Public | Landing page |
| `GET` | `/pricing` | Public | Halaman harga |
| `GET` | `/login` | Public | Form login |
| `GET` | `/register` | Public | Form registrasi |
| `POST` | `/api/register` | Public | Buat user + tenant + subscription |
| `POST` | `/api/products` | Auth | Tambah produk baru |
| `POST` | `/api/scans/run` | Auth | Trigger scan manual untuk tenant |
| `GET` | `/api/cron/scan` | Cron | Scan otomatis semua tenant aktif |
| `*` | `/api/auth/[...nextauth]` | Mixed | Auth.js handlers |

---

## Script yang Tersedia

### Platform (`cd platform`)

| Script | Perintah | Deskripsi |
|---|---|---|
| Dev server | `npm run dev` | Jalankan di port 3001 |
| Build | `npm run build` | Production build |
| Lint | `npm run lint` | ESLint |
| Type check | `npm run typecheck` | TypeScript strict check |
| DB push | `npx drizzle-kit push --force` | Terapkan schema ke database |
| DB seed | `npm run db:seed` | Isi data demo |
| DB studio | `npm run db:studio` | GUI database (Drizzle Studio) |

### Dashboard (`cd dashboard`)

| Script | Perintah | Deskripsi |
|---|---|---|
| Dev server | `npm run dev` | Jalankan di port 3000 |
| Build | `npm run build` | Production build |
| Lint | `npm run lint` | ESLint |
| Type check | `npm run typecheck` | TypeScript strict check |
| Build index | `npm run index` | Bangun indeks SQLite dari filesystem |

---

## Lisensi

Dibuat untuk kompetisi **OpenClaw 2026** oleh Muhammad Sofyan.
