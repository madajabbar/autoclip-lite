# --- Build Stage ---
FROM node:20-bookworm AS builder
WORKDIR /app

# Install build dependencies secara lengkap
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Gunakan clean install dan hapus cache jika ada kegagalan sebelumnya
RUN npm install --include=dev

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    fontconfig \
    fonts-liberation \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Setup Python Virtual Environment for Whisper
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
# Install PyTorch CPU version first to prevent massive CUDA downloads
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt yt-dlp

# Copy files dari builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/requirements.txt ./

# Install production dependencies only
# Menggunakan --build-from-source untuk better-sqlite3 agar aman di Linux
RUN npm install --only=production

# Expose ports for Next.js and FastAPI
EXPOSE 3001 8000

RUN mkdir -p public/autoclip-results public/uploads public/temp

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
