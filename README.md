# 🚀 AutoClip Lite

Platform SaaS untuk memotong video panjang menjadi klip viral (TikTok/Reels/Shorts) secara otomatis menggunakan AI dan FFmpeg.

## 🛠️ Pengembangan Lokal (Windows)

### Prasyarat
- Node.js 20+
- Python 3.10+
- FFmpeg (Pastikan binari ada di `node_modules/ffmpeg-static`)
- yt-dlp (Letakkan `yt-dlp.exe` di folder `bin/`)

### Instalasi
1. Clone repositori ini.
2. Jalankan `npm install`.
3. Instal dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Salin `.env.example` menjadi `.env` dan isi API Key yang dibutuhkan.

### Menjalankan Apps
```bash
npm run dev
```

---

## 🐳 Deployment Manual (Docker & Linux)

Project ini dikonfigurasi untuk di-build secara otomatis oleh GitHub Actions dan di-push ke **GitHub Container Registry (GHCR)**. Anda dapat mendeploynya secara manual di server Anda.

### Persiapan di Server
1. Pastikan **Docker** dan **Docker Compose** sudah terinstal.
2. Buat folder project: `mkdir ~/autoclip-lite && cd ~/autoclip-lite`.
3. Buat file `.env` di dalam folder tersebut dan isi konfigurasinya.
4. Salin file `docker-compose.yml` dari repositori ke folder tersebut.

### Langkah-langkah Deployment
Setiap kali ada update di GitHub, jalankan perintah berikut di server Anda:

1. **Login ke GHCR** (Hanya perlu sekali per sesi):
   ```bash
   echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```
2. **Tarik Image Terbaru & Jalankan**:
   ```bash
   docker compose pull
   docker compose up -d
   ```

---

## 🤖 CI/CD (GitHub Actions)

Workflow GitHub Actions saat ini dikonfigurasi hanya untuk:
- Melakukan **Build** Docker Image.
- Melakukan **Push** ke GHCR (`ghcr.io/username/autoclip-lite:latest`).

*Fitur SSH Auto-Deploy dinonaktifkan sesuai permintaan.*

---

## 🔑 Variabel Environment (.env)

Lengkapi variabel berikut di file `.env` server Anda:
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `WHISPER_MODEL` (tiny/base)
- `SUBTITLE_STYLE` (tiktok/netflix)

---

## 📄 Lisensi
Private / Kepemilikan Pribadi.
