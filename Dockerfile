# =====================
# Dockerfile para Next.js SSR
# =====================

# Etapa de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos package.json y package-lock.json / pnpm-lock.yaml
COPY package*.json ./

# Instala npm (ya viene con node) y pnpm si lo necesitas
# RUN npm install -g pnpm  # Descomenta solo si quieres pnpm

# Instala dependencias
RUN npm install

# Copiamos todo el código
COPY . .

# Build de Next.js
RUN npm run build

# =====================
# Etapa de producción
# =====================
FROM node:18-alpine
WORKDIR /app

# Copiamos build desde builder
COPY --from=builder /app ./

# Exponer puerto interno que escucha Next.js
EXPOSE 3000

# Inicia la app en todas las interfaces para que el proxy de Dokploy pueda conectarse
CMD ["npm", "start", "--", "-H", "0.0.0.0"]