#!/bin/bash

# Script para iniciar nginx en producción
echo "🔧 Iniciando aplicación en producción..."

# Mostrar información de debug
echo "🔍 Variables de entorno disponibles:"
echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-'NO CONFIGURADA'}"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:-'NO CONFIGURADA'}"

# Si las variables no están disponibles en runtime, no es crítico
# porque ya deberían estar compiladas en el build
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "⚠️ Advertencia: Variables de entorno no disponibles en runtime"
    echo "ℹ️ Esto es normal si están compiladas en el build"
fi

echo "✅ Configuración completada"
echo "📦 Iniciando servidor nginx..."

# Iniciar nginx
nginx -g "daemon off;"