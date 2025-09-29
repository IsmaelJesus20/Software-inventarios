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

// Tipos de Supabase (mapping) - Estructura real de la base de datos
export interface SupabaseMaterial {
  id: string
  name: string                    // Campo real en Supabase
  category: string               // Campo real en Supabase
  location: string               // Campo real en Supabase
  current_stock: number          // Campo real en Supabase
  min_stock: number | null       // Campo real en Supabase
  initial_stock: number          // Campo real en Supabase
  created_at: string
  updated_at: string
  unit: string | null            // Campo real en Supabase
}

export interface SupabaseMovement {
  id: string
  material_id: string            // Campo real en Supabase
  material_name: string          // Campo real en Supabase
  type: string                   // Campo real en Supabase
  quantity: number               // Campo real en Supabase
  responsible: string            // Campo real en Supabase
  comment: string                // Campo real en Supabase
  timestamp: string              // Campo real en Supabase
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
export function mapSupabaseItemToMaterial(item: SupabaseMaterial): Material {
  return {
    id: item.id,
    codigo: item.id,                              // Usar ID como código
    name: item.name,                              // Campo real
    category: item.category || 'Sin categoría',   // Campo real
    location: item.location || 'Sin ubicación',   // Campo real
    currentStock: item.current_stock,             // Campo real
    minStock: item.min_stock || 0,                // Campo real
    initialStock: item.initial_stock || 0,        // Campo real
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }
}

export function mapMaterialToSupabaseItem(material: Partial<Material>): Partial<SupabaseMaterial> {
  return {
    name: material.name || '',
    category: material.category,
    location: material.location,
    current_stock: material.currentStock || 0,
    min_stock: material.minStock || 0,
    initial_stock: material.initialStock || 0,
  }
}

export function mapSupabaseMovementToMovement(
  movement: SupabaseMovement
): Movement {
  // Los datos ya vienen en el formato correcto desde Supabase
  let type: 'create' | 'increase' | 'decrease'
  switch (movement.type.toLowerCase()) {
    case 'increase':
      type = 'increase'
      break
    case 'decrease':
      type = 'decrease'
      break
    default:
      type = 'create'
      break
  }

  return {
    id: movement.id,
    materialId: movement.material_id,
    materialName: movement.material_name,
    type: type,
    quantity: movement.quantity,
    responsible: movement.responsible,
    comment: movement.comment || 'Sin comentarios',
    timestamp: new Date(movement.timestamp)
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