## 1. Rekomendasi Payment

Lovable's built-in payments (Stripe/Paddle) **tidak tersedia** untuk seller country Indonesia + tipe produk marketplace komisi. Jadi opsi realistis untuk Rumah Commis:

**Rekomendasi utama: Midtrans (Snap)**
- Payment gateway lokal Indonesia, mendukung QRIS, VA (BCA/Mandiri/BNI/BRI/Permata), GoPay, OVO, DANA, ShopeePay, kartu kredit — semua metode yang sudah muncul di mock checkout.
- Sandbox gratis, tanpa verifikasi bisnis untuk testing.
- Cara integrasi di stack ini: Snap redirect/popup dari client + TanStack server function untuk create transaction + server route `/api/public/webhooks/midtrans` untuk notifikasi status (update `orders.status` → `paid`, insert `payments`, isi `wallet_transactions` escrow).
- Butuh 2 secret dari akun Midtrans: `MIDTRANS_SERVER_KEY` + `MIDTRANS_CLIENT_KEY` (nanti diminta lewat add_secret setelah kamu setuju).

Alternatif kalau nanti mau: **Xendit** (fitur mirip, UX developer sedikit lebih rapi), atau tetap **mock** untuk demo.

## 2. Rencana build (jika kamu setuju Midtrans)

### A. Payment (Midtrans sandbox)
1. Tambah 2 secret: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` via `add_secret`.
2. Server fn `createMidtransTransaction` (`src/lib/payments.functions.ts`, pakai `requireSupabaseAuth`): validasi order milik buyer, panggil Snap API, simpan `payments` row status `pending`, return `snap_token` + `redirect_url`.
3. Update `src/routes/orders.$id.checkout.tsx`: ganti mock button → load `snap.js` (client key), buka Snap popup pakai token dari server fn. Kalau `onSuccess` callback → optimistic redirect ke `/orders/$id` (webhook yang otoritatif).
4. Server route publik `src/routes/api/public/webhooks/midtrans.ts`: verifikasi signature SHA-512 (`order_id+status_code+gross_amount+server_key`), lalu pakai `supabaseAdmin` untuk:
   - update `payments.status` (settlement/capture → `succeeded`, deny/expire/cancel → `failed`)
   - update `orders.status` → `paid` saat sukses (escrow: dana masih di platform)
   - insert `wallet_transactions` tipe `hold` untuk artist
5. Tetap sisakan tombol "Mode demo" (mock) di bawah, on/off via `import.meta.env.VITE_PAYMENTS_DEMO` supaya bisa presentasi tanpa akun Midtrans aktif.

### B. Artist buat komisi baru
Route `src/routes/artist.commissions.new.tsx` sudah ada dan fungsional (form judul, kategori, deskripsi, harga, TAT, slot, cover upload → insert `commissions`). Yang perlu diperbaiki supaya artist gampang ke sana:
1. Cek `src/routes/dashboard.tsx` & `src/routes/become-artist.tsx` — pastikan ada CTA "Buat Komisi Baru" yang link ke `/artist/commissions/new` untuk user berperan `artist`.
2. Tambah shortcut di navbar (`SiteHeader`) untuk role artist: menu "Komisi Saya" → `/artist/commissions`.
3. Auto-create `artist_profiles` row saat user pertama kali buka `/artist/commissions/new` kalau belum ada (biar tidak gagal FK).
4. Validasi ringan di form (harga > 0, slot > 0), dan setelah publish langsung redirect ke detail komisi (sudah).

### C. Sync GitHub
Semua perubahan file yang di-apply di Lovable otomatis push ke repo GitHub yang sudah terkoneksi. Tidak ada langkah manual — cukup pastikan project sudah terhubung ke GitHub via menu `+ → GitHub → Connect project`. Kalau belum, aku akan kasih instruksi setelah build selesai.

### D. PRD v1.6
Generate `/mnt/documents/PRD-RumahCommis-v1.6.md`:
- Update seksi Payment: Midtrans sebagai provider utama (Snap + webhook), escrow lewat `wallet_transactions`, fallback mock mode.
- Update seksi Artist Onboarding: alur buat komisi baru + auto-create `artist_profiles`.
- Update navigasi role-aware.
- Sisanya sama dengan v1.5.

## File yang akan disentuh (saat build mode)

Baru:
- `src/lib/payments.functions.ts`
- `src/routes/api/public/webhooks/midtrans.ts`
- `/mnt/documents/PRD-RumahCommis-v1.6.md`

Diubah:
- `src/routes/orders.$id.checkout.tsx` (integrasi Snap + toggle demo)
- `src/routes/artist.commissions.new.tsx` (auto-ensure artist_profiles, validasi)
- `src/routes/dashboard.tsx` / `src/components/site-shell.tsx` (CTA + menu artist)

Secret (via add_secret, butuh input kamu):
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`

## Yang perlu kamu konfirmasi sebelum aku eksekusi

1. **Pakai Midtrans sandbox?** (Ya / Pakai mock dulu / Pilih Xendit)
2. Kalau ya Midtrans: siapkan akun di https://dashboard.sandbox.midtrans.com → Settings → Access Keys, nanti aku minta 2 key itu lewat form aman.
