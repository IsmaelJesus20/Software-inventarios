// Tipos adaptados de la estructura de Supabase a la interfaz de la app

// Tipo original de la app
export interface Material {
  id: string
  codigo: string
  name: string
  category: string
  location: string
  currentStock: number
  minStock: number
  initialStock: number
  createdAt: Date
  updatedAt: Date
}

// Tipo original de la app
export interface Movement {
  id: string
  materialId: string
  materialName: string
  type: 'create' | 'increase' | 'decrease'
  quantity: number
  responsible: string
  comment: string
  timestamp: Date
}

// Tipos de Supabase (mapping)
export interface SupabaseInventoryItem {
  id: string
  codigo: string
  descripcion: string
  categoria: string | null
  ubicacion: string | null
  stock_actual: number
  stock_minimo: number | null
  precio_unitario: number | null
  unidad_medida: string | null
  estado: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface SupabaseInventoryMovement {
  id: string
  item_id: string
  tipo_movimiento: string
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  motivo: string | null
  comentarios: string | null
  documento_referencia: string | null
  usuario_id: string
  created_at: string
}

export interface SupabaseProfile {
  id: string
  role: string
  nombre_completo: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  email: string | null
}

// Funciones de mapping entre Supabase y la app
export function mapSupabaseItemToMaterial(item: SupabaseInventoryItem): Material {
  return {
    id: item.id,
    codigo: item.codigo,
    name: item.descripcion,
    category: item.categoria || 'Sin categoría',
    location: item.ubicacion || 'Sin ubicación',
    currentStock: item.stock_actual,
    minStock: item.stock_minimo || 0,
    initialStock: item.stock_actual, // Para mantener compatibilidad
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }
}

export function mapMaterialToSupabaseItem(material: Partial<Material>): Partial<SupabaseInventoryItem> {
  return {
    descripcion: material.name || '',
    categoria: material.category,
    ubicacion: material.location,
    stock_actual: material.currentStock || 0,
    stock_minimo: material.minStock || 0,
  }
}

export function mapSupabaseMovementToMovement(
  movement: SupabaseInventoryMovement,
  materialName: string,
  responsibleName: string
): Movement {
  // Mapear tipo_movimiento de Supabase a tipo de la app
  let type: 'create' | 'increase' | 'decrease'
  switch (movement.tipo_movimiento.toLowerCase()) {
    case 'entrada':
      type = 'increase'
      break
    case 'salida':
      type = 'decrease'
      break
    default:
      type = 'create'
      break
  }

  return {
    id: movement.id,
    materialId: movement.item_id,
    materialName: materialName,
    type: type,
    quantity: movement.tipo_movimiento === 'salida' ? -movement.cantidad : movement.cantidad,
    responsible: responsibleName,
    comment: movement.comentarios || movement.motivo || 'Sin comentario',
    timestamp: new Date(movement.created_at)
  }
}

// Tipos de roles según tu estructura
export type UserRole = 'admin_padre' | 'admin' | 'tecnico'

// Mapear roles de Supabase a roles de la app
export function mapSupabaseRoleToAppRole(supabaseRole: string): 'admin' | 'user' | 'viewer' {
  switch (supabaseRole) {
    case 'admin_padre':
    case 'admin':
      return 'admin'
    case 'tecnico':
      return 'user'
    default:
      return 'viewer'
  }
}

export function mapAppRoleToSupabaseRole(appRole: 'admin' | 'user' | 'viewer'): string {
  switch (appRole) {
    case 'admin':
      return 'admin'
    case 'user':
      return 'tecnico'
    case 'viewer':
    default:
      return 'tecnico'
  }
}