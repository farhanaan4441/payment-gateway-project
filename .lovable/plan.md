## Akar masalah "invalid login credentials"

Dari auth logs: kamu selama ini masuk pakai **Google OAuth** (`muhfaarhaan@gmail.com` dan `muhamadfarhan3802@gmail.com` — keduanya `provider: google`, `login_method: oidc`). Tidak ada satu pun event `password` grant di log.

Artinya:
- Akun `muhfaarhaan@gmail.com` **dibuat via Google**, bukan via form email+password.
- Akun Google **tidak punya password** di Supabase. Password hanya ada kalau kamu signup lewat form email+password.
- Waktu kamu coba login pakai email + password → Supabase cek password → tidak ada → `invalid_credentials`. Ini **bukan bug**, ini konsekuensi akun Google-only.

Auto-confirm email sudah aktif (dikonfirmasi turn sebelumnya + akun `muhamadfarhan3802` yang baru signup `email_confirmed_at` langsung terisi). Jadi signup baru via form email+password sekarang bisa langsung login.

## Rencana eksekusi

1. **Tidak ada perubahan kode.** Masalah user-flow, bukan bug.
2. **Verifikasi lewat `supabase--read_query`**: cek `auth.identities` untuk konfirmasi kedua akun kamu memang provider=google-only (bukan email). Ini bukti final.
3. **Kasih user 2 opsi jalan keluar** (di pesan setelah plan di-approve):
   - **A. Tetap pakai Google** untuk email-email itu (paling simpel).
   - **B. Buat akun baru** pakai email lain via form Daftar → email+password akan langsung jalan (auto-confirm aktif).
   - **C. Kalau mau `muhfaarhaan@gmail.com` bisa login pakai password juga**: hapus user itu dari Backend → Users, lalu signup ulang via form Daftar dengan password.
4. **Generate PRD v1.5** ke `/mnt/documents/PRD-RumahCommis-v1.5.md`:
   - Update bagian Auth: jelaskan bahwa akun Google dan akun email+password terpisah (satu email = satu provider identity di setup ini), auto-confirm aktif untuk signup email.
   - Tambah "Known UX pitfall" section: user signup via Google lalu coba login via email/password → invalid_credentials. Rekomendasi UX ke depan: deteksi email yang sudah ada di provider Google saat form email login dan arahkan ke tombol Google.
   - Sisanya sama dengan v1.4 (kategori final, hero panel dekoratif, roadmap payment ditunda).

## File yang disentuh (saat build mode)

- Tool call: `supabase--read_query` (verifikasi identities — read-only)
- File baru: `/mnt/documents/PRD-RumahCommis-v1.5.md`
- **Tidak ada perubahan kode frontend/backend.**
