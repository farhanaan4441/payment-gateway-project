## Rencana

### 1. Email verifikasi otomatis
- Aktifkan infrastruktur email Lovable + scaffold template email auth (signup confirmation, magic link, recovery, dll).
- Setelah ini, setiap pendaftar baru otomatis menerima email verifikasi bermerek "Rumah Commis", dan user yang login tapi belum verifikasi bisa minta kirim ulang (tombol resend sudah ada di dialog auth).
- Jika domain email belum di-setup, akan muncul dialog setup domain dulu (perlu langkah singkat dari kamu).

### 2. Ganti hero image jadi visual non-foto
Di `src/routes/index.tsx`, hapus `<img>` hero, ganti dengan **panel dekoratif** agar space tidak kosong:
- Background gradient lembut (warna brand primary → accent).
- Pola dekoratif geometris (lingkaran/blob blur, garis tipis, dotted grid) pakai pure CSS/SVG — tidak ada gambar generatif.
- Floating "badge" card berisi info ringkas: ⭐ rating, jumlah seniman aktif, contoh kategori populer (Ilustrasi, Chibi, Logo) sebagai chip.
- Tetap responsif, mobile tetap rapi.
- Hapus import `hero-collage.jpg`.

### Detail teknis
- Tool: `email_domain--check_email_domain_status` → bila perlu, tampilkan setup dialog → `email_domain--scaffold_auth_email_templates`.
- File yang diubah: `src/routes/index.tsx` (hero section saja).
- Tidak ada perubahan database atau logic lain.
