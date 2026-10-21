# syntax=docker/dockerfile:1
#
# Image produksi ALTARA.
#
# Multi-stage: dependencies -> builder -> runner.
# Tahap runner hanya berisi server Node + hasil `next build` mode standalone,
# sehingga ukurannya jauh lebih kecil daripada image yang memuat node_modules
# penuh.

# ---------- 1. Dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Pnpm versi 10 (lockfileVersion 9.0). Dipasang via corepack supaya versinya
# terkunci dan tidak bergantung pada image.
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

# Hanya manifest yang disalin dulu, supaya layer install ter-cache dan tidak
# di-rebuild setiap kali kode sumber berubah.
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ---------- 2. Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build produksi. `next build` menghasilkan `.next/standalone/server.js`.
# DATABASE_URL sengaja tidak diset: saat build, layer query memakai fallback
# statis `src/data/content.ts`, jadi build tidak butuh database yang hidup.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- 3. Migrator ----------
# Image terpisah untuk job sekali jalan: migrasi skema + seed.
# Butuh devDependency `tsx` dan sumber `src/data/content.ts`, jadi memakai
# node_modules penuh dari tahap deps.
FROM node:22-alpine AS migrator
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY scripts ./scripts
COPY src/data ./src/data
COPY db ./db

ENV NEXT_TELEMETRY_DISABLED=1

# Panggil `tsx` langsung (bukan lewat `pnpm run`) supaya tidak bergantung
# pada lockfile atau state install di dalam image. Folder `node_modules/.bin`
# ikut tersalin bersama node_modules, jadi `tsx` tersedia.
#
# Perintah default: jalankan migrasi lalu seed. Override dengan
# `docker compose run --rm migrate <perintah>` bila perlu.
CMD ["sh", "-c", "./node_modules/.bin/tsx scripts/migrate.ts && ./node_modules/.bin/tsx scripts/seed.ts"]

# ---------- 4. Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# `libc6-compat` dibutuhkan sharp (libvips) dan `wget` dipakai healthcheck.
RUN apk add --no-cache libc6-compat wget

# Jangan jalankan sebagai root.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Folder upload gambar: berada di luar `public/` supaya bisa di-mount sebagai
# volume Docker terpisah dari image.
RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data/uploads

# Server standalone + aset statis + public.
# Berkas `pg` dan `sharp` ikut terbawa karena ditandai external di
# `next.config.mjs`.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]