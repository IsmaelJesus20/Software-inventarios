#!/bin/bash

# Script para inyectar variables de entorno en el build de Vite
echo "🔧 Configurando variables de entorno para producción..."

# Verificar que las variables existen
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas"
    exit 1
fi

echo "✅ Variables de entorno configuradas"
echo "📦 Iniciando servidor nginx..."

# Iniciar nginx
nginx -g "daemon off;"