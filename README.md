# NEXORA PREMIUM — Supabase backend version

Semua file website berada langsung di root ZIP:
- `index.html` — storefront publik
- `admin.html` — login admin + kelola produk
- `style.css` — UI responsif
- `script.js` — membaca katalog live dan link WhatsApp
- `config.js` — URL dan anon/public key Supabase
- `supabase-setup.sql` — tabel, RLS policies, storage bucket, katalog awal
- `README.md` — panduan

## Setup sekali saja
1. Buka Supabase project: https://supabase.com/dashboard/project/wbvtxojsjmkvbbymvriv
2. Masuk **Project Settings → API**. Salin **Project URL** dan **anon/public key**. `config.js` sudah diisi Project URL; tempel anon/public key ke `supabaseAnonKey`. Jangan gunakan `service_role` / secret key di browser.
3. Buka **Authentication → Users** dan buat user admin dengan email + password.
4. Buka `supabase-setup.sql`. Email admin di SQL sudah disetel ke `andrearshavinkece73@gmail.com`. Pastikan akun Supabase Auth dibuat dengan email yang sama. Jalankan seluruh SQL di **SQL Editor**.
5. Upload semua file langsung ke root repo GitHub dan commit. Pastikan `config.js` ikut ter-upload.
6. Tunggu Vercel deploy, buka `/admin.html`, lalu login dengan email/password tadi.
7. Di admin, atur nomor WhatsApp, upload banner, tambah/edit produk, gambar, harga, diskon, stok.

## Penting soal keamanan
- Hanya email yang disetel dalam SQL policies yang boleh mengubah data dan upload gambar. Ganti `admin@contoh.com` di semua policy sebelum menjalankan SQL.
- `anon/public key` memang dipakai di browser dan aman hanya jika RLS policies dipasang dengan benar. Jangan pernah menaruh `service_role` key.
- Jangan menonaktifkan RLS.
- Buat akun admin dengan password kuat dan jangan bagikan password.
- Untuk mengganti admin email di kemudian hari, ubah policy terkait lewat SQL Editor.

## Cara kerja
- Produk dan stok dibaca dari Supabase; perubahan admin tersinkron ke toko publik.
- Gambar produk/banner diupload dari HP ke Supabase Storage bucket `product-images`.
- Order tetap dikonfirmasi manual via WhatsApp. QRIS belum otomatis; kirim QRIS resmi setelah pesanan/stok dikonfirmasi.

## Catatan
Sistem ini belum bisa dianggap aktif sebelum konfigurasi `config.js`, SQL, user admin, dan deploy selesai. Jangan mengirim anon key melalui chat; masukkan langsung ke `config.js` di repo.
