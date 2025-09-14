# SaaS Inventory - Sistema de Gestión de Inventarios

## 🚀 Descripción

SaaS Inventory es un sistema moderno de gestión de inventarios que combina lo mejor de dos enfoques:
- **Interfaz visual e intuitiva** con dashboard de estadísticas y chat inteligente
- **Backend robusto** con control granular de usuarios y seguimiento detallado

## ⚠️ ESTADO ACTUAL: PROTOTIPO

**IMPORTANTE**: Esta es una versión prototipo con datos simulados. Ver `FUTURE_MODIFICATIONS.md` para las modificaciones pendientes para producción.

## 🔐 Usuarios de Prueba

| Rol | Email | Password | Permisos |
|-----|-------|----------|----------|
| **Admin** | admin@saas-inventory.com | admin123 | Todos los permisos |
| **Usuario** | juan.perez@company.com | user123 | Lectura y escritura |
| **Usuario** | maria.garcia@company.com | user456 | Lectura y escritura |
| **Viewer** | viewer@company.com | view123 | Solo lectura |

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Iconos**: Lucide React
- **Routing**: React Router DOM
- **Estado**: React Query + Context
- **Gráficos**: Recharts

## 🚀 Instalación y Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:5173
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base de UI
│   ├── dashboard/       # Componentes del dashboard
│   ├── chat/           # Chat inteligente
│   ├── forms/          # Formularios
│   └── layout/         # Componentes de layout
├── hooks/              # Hooks personalizados
├── services/           # Servicios (auth, inventory)
├── lib/               # Utilidades
└── pages/             # Páginas principales
```

## 🎯 Funcionalidades

### ✅ Implementado (Prototipo)
- [x] Autenticación con múltiples roles
- [x] Dashboard con estadísticas en tiempo real
- [x] Gestión de materiales e inventario
- [x] Historial de movimientos
- [x] Chat inteligente (respuestas locales)
- [x] Búsqueda y filtros
- [x] Interfaz responsive

### ⏳ Pendiente (Producción)
- [ ] Conexión con Supabase
- [ ] Chat IA con API real
- [ ] Webhooks e integraciones
- [ ] Reportes avanzados
- [ ] Notificaciones
- [ ] Multi-tenant

## 🔄 Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción  
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 📊 Dashboard

### Vista Simple
- Estadísticas generales
- Materiales con stock bajo
- Actividad reciente
- Acceso rápido a funciones

### Vista Técnica  
- Formularios detallados
- Gestión granular de stock
- Audit trail completo
- Configuraciones avanzadas

## 💬 Chat Inteligente

Funcionalidades del chat (modo offline):
- Consultas sobre stock mínimo
- Materiales sin existencias
- Reportes y resúmenes
- Estadísticas generales

## 🔐 Sistema de Permisos

- **Admin**: Acceso completo al sistema
- **User**: Lectura y gestión de inventario
- **Viewer**: Solo consulta de datos

## 🚨 Notas Importantes

1. **Datos Mock**: Toda la información es simulada
2. **Sin Persistencia**: Los cambios se pierden al recargar
3. **Prototipo**: Solo para testing y desarrollo
4. **Producción**: Ver `FUTURE_MODIFICATIONS.md`

---

**Desarrollado como prototipo funcional - Listo para integraciones de producción**