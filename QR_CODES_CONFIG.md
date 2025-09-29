# 🔧 Configuración de Códigos QR

## Problema Solucionado
Los códigos QR no funcionaban al escanearlos desde dispositivos móviles porque estaban generando URLs con `localhost` o la URL de desarrollo.

## ✅ Solución Implementada

### 1. Nueva Variable de Entorno
Se agregó `VITE_APP_BASE_URL` para configurar la URL base de producción.

**Archivos modificados:**
- `.env` - Agregada variable de ejemplo
- `.env.example` - Documentada la variable
- `easypanel.yml` - Incluida en configuración de despliegue
- `Dockerfile` - Agregada como build arg y env var

### 2. Componente QRCodeGenerator Mejorado
- Usa `VITE_APP_BASE_URL` cuando está configurada
- Fallback a `window.location.origin` para desarrollo
- Muestra advertencias cuando usa URLs de desarrollo
- Información clara sobre la URL generada

## 🚀 Cómo Configurar en Producción

### Paso 1: Determinar tu URL de Producción
Necesitas identificar la URL real donde está desplegada tu aplicación.

**Opciones comunes:**
- Si usas Easypanel: `https://tu-app.tu-dominio.com`
- Si usas un dominio personalizado: `https://inventario.tu-empresa.com`
- Si usas la URL de Easypanel: `https://app.xxxxxx.easypanel.host`

### Paso 2: Configurar la Variable en Easypanel

1. Ve a tu panel de Easypanel
2. Busca tu aplicación SaaS Inventory
3. Ve a la sección de Variables de Entorno
4. Agrega una nueva variable:
   ```
   VITE_APP_BASE_URL=https://tu-url-real.com
   ```
5. Guarda y redespliega la aplicación

### Paso 3: Actualizar .env Local (Opcional)
Para desarrollo, puedes actualizar tu archivo `.env`:
```env
VITE_APP_BASE_URL=https://tu-url-real.com
```

## 🧪 Cómo Verificar que Funciona

### Para Pruebas Locales (Red Local):
1. Para el servidor actual si está corriendo
2. Ejecuta: `npm run dev:host` (o `npm run dev -- --host`)
3. Vite te dará dos URLs:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.XXX:5173/
   ```
4. Abre la URL **Network** en tu navegador
5. Genera un código QR - ahora mostrará "🟡 Red Local"
6. Escanea el QR con tu móvil (conectado a la misma WiFi)
7. Debe funcionar correctamente

### Para Producción:
1. Despliega la aplicación con la nueva variable configurada
2. Inicia sesión en la aplicación desde producción
3. Ve a cualquier material y genera su código QR
4. La URL mostrada debe ser tu dominio de producción (🟢 Producción)
5. Escanea el QR con tu móvil
6. Debe abrir la aplicación y llevarte a la página de modificar stock

## ⚠️ Indicadores del Sistema

El componente QRCodeGenerator ahora muestra indicadores visuales:

### 🔴 Localhost
- **URL**: `http://localhost:5173` o `http://127.0.0.1:5173`
- **Funciona en**: Solo en tu PC
- **Solución**: Usa `npm run dev:host` y abre la URL Network

### 🟡 Red Local
- **URL**: `http://192.168.1.XXX:5173` (IP de tu PC)
- **Funciona en**: Dispositivos en la misma WiFi
- **Ideal para**: Pruebas locales con móviles

### 🟢 Producción
- **URL**: Tu dominio real (ej: `https://inventario.empresa.com`)
- **Funciona en**: Cualquier dispositivo con Internet
- **Configurado con**: `VITE_APP_BASE_URL`

### Advertencias Automáticas
- Instrucciones paso a paso cuando detecta localhost
- Información sobre configuración de red
- Sugerencias específicas según el contexto

## 📱 Compatibilidad

Los códigos QR generados son compatibles con:
- Aplicación de cámara nativa de iOS
- Aplicación de cámara nativa de Android
- Google Lens
- Aplicaciones de escáner QR de terceros

## 🔍 Troubleshooting

### El QR no abre en el móvil
- **Causa**: URL de desarrollo o variable no configurada
- **Solución**: Configura `VITE_APP_BASE_URL` con tu dominio real

### El QR abre pero da error 404
- **Causa**: La URL es correcta pero la aplicación no está desplegada
- **Solución**: Verifica que la aplicación esté funcionando en esa URL

### El QR abre pero no carga el material específico
- **Causa**: Problema con el routing o el ID del material
- **Solución**: Verifica que la ruta `/modify-stock/:materialId` funcione correctamente

## 📋 Ejemplo de URLs Generadas

**Desarrollo (antes):**
```
http://localhost:5173/modify-stock/MAT001
```

**Producción (después):**
```
https://inventario.tu-empresa.com/modify-stock/MAT001
```

La URL de producción funcionará desde cualquier dispositivo con acceso a Internet.