import { supabase } from '@/lib/supabase'
import { n8nService } from '@/services/n8n'
import {
  Material,
  Movement,
  mapSupabaseItemToMaterial,
  mapMaterialToSupabaseItem,
  mapSupabaseMovementToMovement,
  type SupabaseInventoryItem,
  type SupabaseInventoryMovement,
  type SupabaseProfile
} from '@/types/database'

export type { Material, Movement }

class InventoryService {
  async getMaterials(): Promise<Material[]> {
    try {
      // Add timeout to prevent hanging requests
      const materialsPromise = supabase
        .from('inventory_items')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Materials fetch timeout')), 15000)
      })

      const { data, error } = await Promise.race([materialsPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error en query materials:', error)
        throw new Error(`Error obteniendo materiales: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron materiales activos')
        return []
      }

      return data.map(mapSupabaseItemToMaterial)
    } catch (error) {
      console.error('❌ Error en getMaterials:', error)
      throw error instanceof Error ? error : new Error('Error desconocido obteniendo materiales')
    }
  }

  async getMovements(): Promise<Movement[]> {
    try {
      // Add timeout to prevent hanging requests
      const movementsPromise = supabase
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Movements fetch timeout')), 10000)
      })

      const { data: movements, error: movementsError } = await Promise.race([movementsPromise, timeoutPromise]) as any

      if (movementsError) {
        console.error('❌ Error en query movements:', movementsError)
        // Don't throw error, return empty array to prevent app blocking
        console.warn('⚠️ Returning empty movements due to error')
        return []
      }

      if (!movements || movements.length === 0) {
        return []
      }

      // Por ahora, usamos nombres genéricos para evitar problemas de foreign keys
      return movements.map(movement => {
        const materialName = 'Material ID: ' + movement.item_id.slice(0, 8)
        const responsibleName = 'Usuario ID: ' + movement.usuario_id.slice(0, 8)

        return mapSupabaseMovementToMovement(movement, materialName, responsibleName)
      })
    } catch (error) {
      console.error('❌ Error en getMovements:', error)
      // No lanzar error aquí, solo retornar array vacío para no bloquear la app
      return []
    }
  }

  async createMaterial(materialData: {
    name: string
    category: string
    location: string
    current_stock: number
    min_stock: number
    initial_stock: number
  }): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Usar n8n para crear el material
      const response = await n8nService.createMaterial({
        codigo: n8nService.generateMaterialCode(),
        name: materialData.name,
        category: materialData.category,
        location: materialData.location,
        current_stock: materialData.current_stock,
        min_stock: materialData.min_stock,
        precio_unitario: 0,
        unidad_medida: 'unidad',
        comment: 'Material creado desde la aplicación',
        usuario_id: user.id,
        usuario_email: user.email
      });

      if (response.status === 'error') {
        throw new Error(response.message)
      }

      return response
    } catch (error) {
      console.error('Error en createMaterial:', error)
      throw error instanceof Error ? error : new Error('Error desconocido creando material')
    }
  }

  async updateStock(materialId: string, change: number, comment: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      if (change === 0) {
        throw new Error('El cambio de stock debe ser diferente de cero')
      }

      let response;

      if (change > 0) {
        // Aumentar stock usando n8n
        response = await n8nService.increaseStock({
          item_id: materialId,
          cantidad: Math.abs(change),
          comment: comment,
          usuario_id: user.id,
          usuario_email: user.email
        });
      } else {
        // Reducir stock usando n8n
        response = await n8nService.decreaseStock({
          item_id: materialId,
          cantidad: Math.abs(change),
          comment: comment,
          usuario_id: user.id,
          usuario_email: user.email
        });
      }

      if (response.status === 'error') {
        throw new Error(response.message)
      }

      return response
    } catch (error) {
      console.error('Error en updateStock:', error)
      throw error instanceof Error ? error : new Error('Error desconocido actualizando stock')
    }
  }

  async searchMaterials(query: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('estado', 'activo')
        .or(`descripcion.ilike.%${query}%,codigo.ilike.%${query}%,categoria.ilike.%${query}%,ubicacion.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error buscando materiales: ${error.message}`)
      }

      return data.map(mapSupabaseItemToMaterial)
    } catch (error) {
      console.error('Error en searchMaterials:', error)
      throw error instanceof Error ? error : new Error('Error desconocido buscando materiales')
    }
  }

  async getStats() {
    try {
      // Add timeout to prevent hanging requests
      const statsPromise = Promise.all([
        supabase
          .from('inventory_items')
          .select('stock_actual, stock_minimo')
          .eq('estado', 'activo'),
        supabase
          .from('inventory_movements')
          .select('id')
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      ])

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Stats fetch timeout')), 8000)
      })

      const [materialsResult, movementsResult] = await Promise.race([statsPromise, timeoutPromise]) as any

      const { data: materials, error: materialsError } = materialsResult
      const { data: todayMovements, error: movementsError } = movementsResult

      if (materialsError) {
        console.warn('Error obteniendo estadísticas de materiales:', materialsError.message)
      }

      if (movementsError) {
        console.warn('Error obteniendo movimientos del día:', movementsError.message)
      }

      const totalMaterials = materials?.length || 0
      const lowStock = materials?.filter(m =>
        m.stock_actual <= (m.stock_minimo || 0) && m.stock_actual > 0
      ).length || 0
      const criticalStock = materials?.filter(m => m.stock_actual === 0).length || 0
      const totalMovements = todayMovements?.length || 0

      return {
        totalMaterials,
        lowStock,
        criticalStock,
        totalMovements,
      }
    } catch (error) {
      console.error('Error en getStats:', error)
      // Devolver valores por defecto en caso de error
      return {
        totalMaterials: 0,
        lowStock: 0,
        criticalStock: 0,
        totalMovements: 0,
      }
    }
  }

  // Método para obtener categorías únicas
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('categoria')
        .eq('estado', 'activo')
        .not('categoria', 'is', null)

      if (error) {
        throw new Error(`Error obteniendo categorías: ${error.message}`)
      }

      const uniqueCategories = [...new Set(data.map(item => item.categoria).filter(Boolean))]
      return uniqueCategories.sort()
    } catch (error) {
      console.error('Error en getCategories:', error)
      return []
    }
  }

  // Método para obtener ubicaciones únicas
  async getLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('ubicacion')
        .eq('estado', 'activo')
        .not('ubicacion', 'is', null)

      if (error) {
        throw new Error(`Error obteniendo ubicaciones: ${error.message}`)
      }

      const uniqueLocations = [...new Set(data.map(item => item.ubicacion).filter(Boolean))]
      return uniqueLocations.sort()
    } catch (error) {
      console.error('Error en getLocations:', error)
      return []
    }
  }
}

export const inventoryService = new InventoryService()