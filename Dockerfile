# Dockerfile para producción con Easypanel
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build args para variables de entorno (Easypanel los pasa automáticamente)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_BASE_URL

# Verificar que las variables existen durante el build
RUN echo "Build args recibidos:" && \
    echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-NO_CONFIGURADA}" && \
    echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:-NO_CONFIGURADA}" && \
    echo "VITE_APP_BASE_URL: ${VITE_APP_BASE_URL:-NO_CONFIGURADA}"

# Establecer variables de entorno para el build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

# Build para producción
RUN npm run build

# Verificar que el build se completó
RUN ls -la dist/

# Imagen de producción
FROM nginx:alpine

# Instalar bash para el script de inicio
RUN apk add --no-cache bash

# Copiar los archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Verificar que los archivos se copiaron
RUN ls -la /usr/share/nginx/html/

# Configuración de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]