# FUTURAS MODIFICACIONES - SaaS Inventory

## 🔧 MODIFICACIONES PENDIENTES PARA PRODUCCIÓN

### 1. **AUTENTICACIÓN Y USUARIOS**
- **PENDIENTE**: Conectar con Supabase Auth
- **USUARIOS DE PRUEBA ACTUALES** (mock data):
  - **Admin**: `admin@saas-inventory.com` / `admin123`
  - **Usuario 1**: `juan.perez@company.com` / `user123` 
  - **Usuario 2**: `maria.garcia@company.com` / `user456`
  - **Viewer**: `viewer@company.com` / `view123` (solo lectura)

### 2. **BASE DE DATOS**
- **PENDIENTE**: Conectar con Supabase
- **ESTRUCTURA ACTUAL**: Usando modelo de `inven-query-bot` (más simple)
- **MIGRACIÓN FUTURA**: Implementar estructura más robusta de `te-stock-master` con:
  - Códigos únicos de productos
  - Precios y unidades de medida
  - Audit trail completo
  - Referencias de usuarios en movimientos

### 3. **CHAT IA**
- **PENDIENTE**: Conectar con ChatGPT API o similar
- **ACTUAL**: Solo respuestas locales predefinidas
- **MEJORA FUTURA**: Integración real con IA para análisis avanzados

### 4. **WEBHOOKS Y INTEGRACIONES**
- **PENDIENTE**: Integrar webhook de `te-stock-master` para hojas de cálculo
- **PENDIENTE**: Conectar con N8N para automatizaciones
- **PENDIENTE**: APIs externas según necesidades

### 5. **FUNCIONALIDADES ADICIONALES**
- **Dashboard Simple**: ✅ Implementado (vista general cómoda)
- **Dashboard Técnico**: ✅ Implementado (gestión detallada)
- **PENDIENTE**: Reportes avanzados con gráficos
- **PENDIENTE**: Exportación de datos (CSV, PDF)
- **PENDIENTE**: Notificaciones push/email
- **PENDIENTE**: Multi-tenant (varios clientes)

### 6. **ARCHIVOS CLAVE PARA MODIFICAR**
- `src/services/auth.ts` - Cambiar mock por Supabase Auth
- `src/services/inventory.ts` - Cambiar mock por Supabase queries
- `src/components/chat/IntelligentChat.tsx` - Conectar API real
- `src/hooks/useAuth.ts` - Integrar autenticación real
- `package.json` - Agregar @supabase/supabase-js y otras deps

### 7. **CONFIGURACIÓN DE ENTORNO**
- **PENDIENTE**: Variables de entorno (.env)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_OPENAI_API_KEY`
  - `VITE_WEBHOOK_URL`

---
**NOTA**: Este es un prototipo funcional con datos mock. Todas las conexiones externas están simuladas para desarrollo y testing.