## Perubahan

### 1. Hapus kategori "Emote & Stiker"
- Tambah migration baru: `DELETE FROM public.categories WHERE slug = 'emote';`
- Kategori ini akan hilang dari Home (Category Strip), halaman `/categories`, dan filter `/explore`.

### 2. Perbaiki gambar hero yang tidak muncul
Masalah: `src/routes/index.tsx` memakai URL Unsplash eksternal (`images.unsplash.com/...`) — bisa gagal load karena jaringan/hotlink dan tidak ada fallback.

Solusi:
- Generate ulang `src/assets/hero-collage.jpg` dengan gaya foto realistis (artist menggambar di tablet, pencahayaan natural, bukan tampak AI), pakai `imagegen` model `standard`.
- Ganti `<img src="https://images.unsplash.com/...">` di Hero menjadi import lokal:
  ```ts
  import heroImg from "@/assets/hero-collage.jpg";
  ...
  <img src={heroImg} alt="Seniman menggambar di tablet digital" ... />
  ```
- Tambah `onError` fallback sederhana (sembunyikan frame bila gagal) supaya layout tetap rapi.

Tidak ada perubahan business logic lain.
