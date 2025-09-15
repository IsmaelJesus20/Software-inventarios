# Dockerfile para producción
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build

# Imagen de producción
FROM nginx:alpine

# Copiar los archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]