# --- Build Stage ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
# ffmpeg, python3, yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    yt-dlp \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Setup Python Virtual Environment for Whisper
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Install production dependencies only
RUN npm install --only=production

# Expose port
EXPOSE 3000

# Create persistence directories
RUN mkdir -p public/autoclip-results public/uploads public/temp

# Entrypoint script to run both Next.js and Worker
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
