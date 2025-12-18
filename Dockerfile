# CAMBIO IMPORTANTE: Usamos Node 20 (Requerido por Next.js 15/16)
FROM node:20-alpine AS base

# 1. Instalar dependencias necesarias para alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. Instalar PNPM globalmente
RUN npm install -g pnpm

# 3. Copiar los archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# 4. Instalar dependencias con PNPM
# --frozen-lockfile asegura que se instale IDÉNTICO a tu PC
RUN pnpm install --frozen-lockfile

# 5. Copiar el código fuente
COPY . .

# 6. Construir la aplicación
RUN pnpm run build

# 7. Configuración para correr la app
ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "start"]