# Rencana Perubahan

## 1. Verifikasi Email Pengguna
- Aktifkan **email confirmation** di Lovable Cloud Auth (matikan auto-confirm) supaya setiap pendaftar (baik customer maupun freelancer/artist) harus klik link verifikasi di email sebelum bisa login.
- Update halaman `/auth` (`src/routes/auth.tsx`):
  - Setelah sign-up sukses, tampilkan pesan "Cek email kamu untuk verifikasi akun" yang jelas (bukan toast sekilas).
  - Tambah link "Kirim ulang email verifikasi" memakai `supabase.auth.resend({ type: 'signup', email })`.
  - Tangani error login "Email not confirmed" dengan pesan ramah + tombol kirim ulang.
- Email verifikasi akan memakai template default Lovable (cukup untuk MVP). Kalau nanti ingin email berbranding "Rumah Commis", bisa setup custom email domain di iterasi lain — di luar scope sekarang.

## 2. Rebrand Nama → "Rumah Commis"
Ganti semua kemunculan "Ngommis-yok" menjadi **Rumah Commis** di:
- `src/components/site-shell.tsx` (logo navbar + footer)
- `src/routes/__root.tsx` (title default, meta)
- `src/routes/auth.tsx` (sidebar branding)
- `src/routes/index.tsx` (meta title, og:title, og:description, copy CTA)
- Halaman lain yang menyebut nama brand: `about.tsx`, `become-artist.tsx`, `dashboard.tsx`, `wallet.tsx`, `orders.*`, `commissions.$slug.tsx`, `explore.tsx`, `categories.tsx`, `artist.commissions.*` — sweep dengan pencarian teks.
- Pesan toast/email copy yang menyebut brand.

Nama teknis (tabel DB, route, env) tidak diubah — hanya teks yang dilihat user.

## 3. Slogan Baru
- Di **Hero** (`src/routes/index.tsx`): ganti headline `Tempat berkarya & berkomisi.` jadi:
  > **Mau pesan gambar?**  
  > **Ke _rumah commis_ aja!**
- Update sub-copy agar nyambung dengan slogan baru (1 kalimat singkat soal escrow & artist lokal).
- Update `<title>` & meta description supaya mengandung slogan.
- Update badge "Marketplace #1…" jadi tagline pendukung yang sesuai.

## 4. Gambar Hero
Dua opsi — pilih salah satu:

- **Opsi A — Hapus gambar hero**: layout hero jadi 1 kolom center, tetap ada CTA + chip "Mulai dari Rp35.000". Bersih, cepat, tanpa kesan AI.
- **Opsi B — Ganti dengan foto realistis**: pakai foto stok asli (mis. dari Unsplash) yang menggambarkan ilustrator sedang menggambar di tablet / meja kerja artist. Saya unggah sebagai asset CDN, bukan generate AI.

Default rencana saya: **Opsi B dengan foto Unsplash** (lebih hangat untuk landing). Tolong konfirmasi atau pilih Opsi A.

## Catatan Teknis (singkat)
- Auth: panggil `supabase--configure_auth` dengan `auto_confirm_email: false`.
- Tidak ada perubahan skema DB.
- Tidak menyentuh file auto-generated (`client.ts`, `types.ts`, dll).
- Sweep rebrand pakai pencarian "Ngommis" agar tidak ada yang terlewat.
