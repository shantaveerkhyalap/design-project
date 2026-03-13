# ─────────────────────────────────────────────
# Stage 1: Builder — Build the Next.js app
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Set NEXT_TELEMETRY_DISABLED to avoid next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Runner — nginx + Node.js standalone
# ─────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

# Security: non-root user
RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R nextuser:nextgroup /app

USER nextuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
