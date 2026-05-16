# TradeJournal Pro 🚀

Trading Journal Dashboard modern full-stack menggunakan Next.js App Router, Tailwind CSS, ShadCN UI, Prisma, dan Supabase.

## 🌟 Fitur Utama

- **Modern Dashboard**: 11 metrik stat card, Equity Curve, Win/Loss Distribution, Monthly Profit.
- **Trading Journal**: CRUD lengkap dengan filter, pencarian, pagination, dan upload screenshot via Cloudinary.
- **Advanced Analytics**: Analisa performa berdasarkan pair dan sesi.
- **AI Insights**: Analisa otomatis berbasis rule engine untuk menemukan kelemahan dan kekuatan tradingmu.
- **Psychology Tracker**: Lacak korelasi antara emosi (FOMO, Greed, Calm) dengan profit/loss.
- **Settings**: Atur mata uang, risiko, target bulanan, dan profil akun.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI + Recharts (Charts)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Auth.js v5) - Credentials
- **Storage**: Cloudinary (Screenshot Upload)

## 📦 Cara Setup & Install

1. **Persiapan Database (Supabase)**
   - Buat proyek di [Supabase](https://supabase.com).
   - Masuk ke Settings -> Database.
   - Ambil URL Connection String (IPv4 / Transaction Pooler) untuk `DATABASE_URL`.
   - Ambil URL Session mode untuk `DIRECT_URL`.

2. **Persiapan Storage (Cloudinary)**
   - Buat akun di [Cloudinary](https://cloudinary.com).
   - Ambil `Cloud Name`, `API Key`, dan `API Secret` dari dashboard.

3. **Clone & Install**
   ```bash
   git clone <repo_url>
   cd "trading jurnal"
   npm install --legacy-peer-deps
   ```

4. **Environment Variables**
   Ubah nama `.env.example` menjadi `.env.local` dan isi nilainya:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   AUTH_SECRET="random-string-minimal-32-karakter"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

5. **Push Schema Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Generate Data Demo (Opsional)**
   Agar dashboard tidak kosong, kamu bisa mengisi data dummy:
   ```bash
   npm run db:seed
   ```
   *Akun Demo: `demo@tradejournalpro.com` / `password123`*

7. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser.

## 🚀 Cara Deploy ke Vercel

1. Push kode ke GitHub.
2. Buka [Vercel](https://vercel.com) dan buat proyek baru (Import dari GitHub).
3. Di bagian **Environment Variables**, masukkan semua variabel yang ada di `.env.local` (kecuali `NEXT_PUBLIC_APP_URL` sesuaikan dengan URL Vercel).
4. Di bagian **Build Command**, pastikan perintahnya: `prisma generate && next build`.
5. Klik **Deploy**.
