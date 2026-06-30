## Penyebab "Invalid login credentials"

Backend Lovable Cloud kamu sekarang **sudah aktif** (signup `muhfaarhaan@gmail.com` berhasil — log auth menunjukkan `confirmation_sent_at` terisi, tapi `email_confirmed_at` kosong).

Akar masalah: **email confirmation masih ON di backend**. Jadi:
- Signup sukses → user dibuat, tapi status "unconfirmed"
- Login dengan password yang sama → ditolak `invalid_credentials` karena Supabase memperlakukan akun unconfirmed = tidak bisa login password
- Tidak ada email verifikasi yang sampai (karena belum ada email domain terkonfigurasi)

Frontend sudah benar (tidak ada UI verifikasi). Yang kurang: **flip setting backend `auto_confirm_email: true`**.

## Yang akan dieksekusi

1. **Aktifkan auto-confirm email** lewat `supabase--configure_auth`:
   - `auto_confirm_email: true`
   - `disable_signup: false`
   - `external_anonymous_users_enabled: false`
   - `password_hibp_enabled: false`
   
   Efek: signup berikutnya akun langsung confirmed → bisa langsung login.

2. **Catatan akun lama `muhfaarhaan@gmail.com`**: akun yang sudah terlanjur dibuat sebelum flag ini aktif kemungkinan tetap unconfirmed. Solusi praktis: signup ulang pakai email lain (atau hapus user lama dari Backend → Users). Setelah auto-confirm aktif, semua signup baru langsung jalan.

3. **Generate PRD v1.4** ke `/mnt/documents/PRD-RumahCommis-v1.4.md`:
   - Konfirmasi auth flow: email + password, **auto-confirm aktif** (tanpa verifikasi email)
   - Catatan operasional: backend lifecycle (pause/resume), efek email confirmation toggle
   - Status fitur saat ini: kategori final (tanpa Emote & Stiker), hero panel dekoratif, auth dialog di navbar, Google OAuth opsional
   - Roadmap belum jadi: wallet, dashboard artist, checkout, pembayaran (provider ditunda)

## File yang disentuh

- Tool call: `supabase--configure_auth`
- File baru: `/mnt/documents/PRD-RumahCommis-v1.4.md`
- Tidak ada perubahan kode frontend (sudah bersih dari turn sebelumnya)
