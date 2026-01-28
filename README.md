# Web Karya KIR

Website untuk melihat dan memposting karya KIR (Karya Ilmiah Remaja).

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (Database & Storage)
- **Shadcn UI** (Component Library)
- **TypeScript**

## Fitur

1. **Login sebagai Pembaca atau Anggota KIR**
   - Pembaca dapat melihat semua karya
   - Anggota dapat login dengan kode rahasia untuk memposting

2. **Upload Karya**
   - Eksperimen
   - Fakta
   - Kata-kata Motivasi
   - Berita Terkini
   - Karya KIR Lainnya (cerpen, puisi, buku, dll)
   - Support upload gambar, video, dan file

3. **Interaksi**
   - Like
   - Komentar
   - Share
   - Download

4. **Filter Kategori**
   - Filter karya berdasarkan kategori
   - Info KIR

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
Buat file `.env.local` dengan isi:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Setup Supabase Database:
Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Create works table
CREATE TABLE works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  file_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for works
INSERT INTO storage.buckets (id, name, public) VALUES ('works', 'works', true);

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'works');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'works');
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Kode Rahasia Anggota

Kode rahasia default: `KIR 19010555X1`

## Contact

- **Phone**: 0882021963545
- **Email**: ahmad.faizin.x
- **Instagram**: ahmad_faizin_x
- **Developer**: AHMAD FAIZIN
