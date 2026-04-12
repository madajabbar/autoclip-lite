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
Perintah ini akan menjalankan Next.js server dan Background Worker secara bersamaan menggunakan `concurrently`.

---

## 🐳 Deployment (Docker & Linux)

Project ini dikonfigurasi untuk dideploy menggunakan Docker di Linux (Debian/Ubuntu).

### Docker Compose
Gunakan `docker-compose.yml` untuk menjalankan aplikasi beserta persistence datanya.

```bash
docker compose up -d
```

**Volume Mapping:**
- `./autoclip.db`: Database SQLite.
- `./public/autoclip-results`: Folder hasil pemrosesan video.
- `./public/uploads`: Folder video yang diunggah pengguna.

---

## 🤖 CI/CD (GitHub Actions)

Otomatisasi build dan deploy tersedia melalui GitHub Actions (`.github/workflows/deploy.yml`).

### Setup GitHub Secrets
Agar CI/CD berjalan, tambahkan **Secrets** berikut di repositori GitHub Anda:
1. `SSH_HOST`: IP atau domain server target.
2. `SSH_USER`: Username SSH server (e.g., `root`).
3. `SSH_KEY`: Private Key SSH untuk login ke server.
4. `GITHUB_TOKEN`: (Otomatis tersedia) Digunakan untuk push image ke GHCR.

### Alur Kerja
- Setiap **push** ke branch `master` akan mentrigger build Docker Image.
- Image di-push ke **GitHub Container Registry (GHCR)**.
- GitHub Actions akan masuk ke server via SSH, menarik image terbaru, dan merestart container.

---

## 🔑 Variabel Environment (.env)

| Kunci | Deskripsi |
|-------|-----------|
| `GROQ_API_KEY` | API Key Groq (Direkomendasikan untuk Whisper cepat) |
| `OPENAI_API_KEY` | API Key OpenAI (Alternatif Whisper atau model lain) |
| `JWT_SECRET` | Secret key untuk enkripsi session user |
| `RESEND_API_KEY` | API Key dari Resend untuk pengiriman email verifikasi |
| `WHISPER_MODEL` | Ukuran model Whisper (`tiny`, `base`, `small`, `medium`) |
| `SUBTITLE_STYLE` | Gaya teks subtitle (`tiktok`, `netflix`, `anime`) |

---

## 📄 Lisensi
Private / Kepemilikan Pribadi.
