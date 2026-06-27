# Hilangkan verifikasi email + kirim PRD terbaru

## 1. Skip verifikasi email — daftar/login langsung pakai email & password

**Backend (Lovable Cloud Auth):**
- Aktifkan **auto-confirm email** — akun langsung aktif begitu signup, tanpa harus klik link verifikasi.
- Tidak perlu setup email domain lagi untuk flow auth.

**Frontend — `src/components/auth-dialog.tsx` & `src/routes/auth.tsx`:**
- Hapus state `pendingVerification` + tombol "Kirim ulang email verifikasi".
- Hapus banner "Verifikasi email kamu".
- Hapus handler `resendVerification` dan cek `"email not confirmed"`.
- Setelah `signUp()` sukses → langsung `toast.success("Akun dibuat, selamat datang!")` dan tutup dialog (user otomatis ter-login karena auto-confirm aktif).
- Field tetap: Nama tampilan (signup), Email, Password — sesuai permintaan kamu.

**Catatan:** Google sign-in tetap ada sebagai opsi tambahan. Trade-off auto-confirm: orang bisa daftar pakai email orang lain (karena tidak ada verifikasi). Untuk MVP biasanya OK.

## 2. PRD terbaru

Generate ulang PRD `Rumah Commis` v1.2 ke `/mnt/documents/PRD-RumahCommis-v1.2.md` dengan update:
- Auth flow: email/password tanpa verifikasi + Google OAuth (revisi dari v1.1)
- Status fitur saat ini: kategori (tanpa Emote & Stiker), hero panel dekoratif (bukan foto), navbar dengan auth dialog
- Roadmap fitur belum jadi: wallet, komisi artist, checkout, dashboard

Hasilnya akan muncul sebagai artifact yang bisa kamu download.

## Yang akan diubah

- Tool: `supabase--configure_auth` → set `auto_confirm_email: true`
- `src/components/auth-dialog.tsx` — bersihkan UI verifikasi
- `src/routes/auth.tsx` — bersihkan UI verifikasi
- File baru: `/mnt/documents/PRD-RumahCommis-v1.2.md`
