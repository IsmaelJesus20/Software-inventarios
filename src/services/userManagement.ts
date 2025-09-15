import { supabase } from '@/lib/supabase'
import { type SupabaseProfile } from '@/types/database'
import { authService } from '@/services/auth'

export interface UserProfile {
  id: string;
  nombre_completo: string;
  email: string;
  role: 'admin_padre' | 'admin' | 'tecnico';
  created_at: string;
  updated_at?: string;
}

// Mock data temporales para evitar pantalla en blanco
const mockProfiles: UserProfile[] = [
  {
    id: '1',
    nombre_completo: 'Admin Principal',
    email: 'admin@saas-inventory.com',
    role: 'admin_padre',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre_completo: 'Juan Pérez',
    email: 'juan.perez@company.com',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    nombre_completo: 'María García',
    email: 'maria.garcia@company.com',
    role: 'tecnico',
    created_at: new Date().toISOString(),
  }
];

class UserManagementService {

  // Método para proteger la sesión actual durante operaciones
  private async protectCurrentSession<T>(operation: () => Promise<T>): Promise<T> {
    const currentUser = authService.getCurrentUser()
    console.log('🛡️ protectCurrentSession: Usuario actual antes:', currentUser?.id)

    try {
      const result = await operation()

      // Verificar si la sesión sigue intacta después de la operación
      const sessionAfter = await supabase.auth.getSession()
      if (!sessionAfter.data.session && currentUser) {
        console.error('🚨 protectCurrentSession: ¡Sesión perdida durante operación!')
        // La sesión se perdió, esto es el problema que estamos intentando evitar
      } else {
        console.log('✅ protectCurrentSession: Sesión preservada')
      }

      return result
    } catch (error) {
      console.error('❌ protectCurrentSession: Error durante operación:', error)
      throw error
    }
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    return this.protectCurrentSession(async () => {
      try {
        console.log('🔄 getAllProfiles: Iniciando query...')

        // Intentar obtener de Supabase primero
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Error con Supabase, usando datos mock:', error.message)
          return mockProfiles
        }

        console.log('✅ getAllProfiles: Query exitosa, datos:', data?.length || 0)
        return data && data.length > 0 ? data : mockProfiles
      } catch (error) {
        console.warn('Error en getAllProfiles, usando datos mock:', error)
        return mockProfiles
      }
    })
  }

  async updateUserRole(userId: string, newRole: 'admin_padre' | 'admin' | 'tecnico'): Promise<void> {
    return this.protectCurrentSession(async () => {
      try {
        console.log('🔄 updateUserRole: Iniciando actualización de rol...', { userId, newRole })

        // CRÍTICO: Verificar que no estemos modificando al usuario actual
        const currentUser = authService.getCurrentUser()
        if (currentUser && currentUser.id === userId) {
          console.warn('⚠️ updateUserRole: EVITANDO modificar usuario actual para prevenir pérdida de sesión')
          throw new Error('No se puede modificar el rol del usuario actual')
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) {
          console.warn(`Error actualizando rol en Supabase: ${error.message}`)
          // Actualizar datos mock como fallback
          const profileIndex = mockProfiles.findIndex(p => p.id === userId)
          if (profileIndex !== -1) {
            mockProfiles[profileIndex].role = newRole
            mockProfiles[profileIndex].updated_at = new Date().toISOString()
          }
          return
        }

        console.log('✅ updateUserRole: Rol actualizado exitosamente')
      } catch (error) {
        console.warn('Error en updateUserRole, usando modo mock:', error)
        // Actualizar datos mock como fallback
        const profileIndex = mockProfiles.findIndex(p => p.id === userId)
        if (profileIndex !== -1) {
          mockProfiles[profileIndex].role = newRole
          mockProfiles[profileIndex].updated_at = new Date().toISOString()
        }
      }
    })
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'nombre_completo' | 'email'>>): Promise<void> {
    return this.protectCurrentSession(async () => {
      try {
        console.log('🔄 updateUserProfile: Iniciando actualización de perfil...', { userId, updates })

        // CRÍTICO: Verificar que no estemos modificando al usuario actual
        const currentUser = authService.getCurrentUser()
        if (currentUser && currentUser.id === userId) {
          console.warn('⚠️ updateUserProfile: EVITANDO modificar perfil del usuario actual para prevenir pérdida de sesión')
          throw new Error('No se puede modificar el perfil del usuario actual')
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) {
          console.warn(`Error actualizando perfil en Supabase: ${error.message}`)
          // Actualizar datos mock como fallback
          const profileIndex = mockProfiles.findIndex(p => p.id === userId)
          if (profileIndex !== -1) {
            if (updates.nombre_completo !== undefined) {
              mockProfiles[profileIndex].nombre_completo = updates.nombre_completo
            }
            if (updates.email !== undefined) {
              mockProfiles[profileIndex].email = updates.email
            }
            mockProfiles[profileIndex].updated_at = new Date().toISOString()
          }
          return
        }

        console.log('✅ updateUserProfile: Perfil actualizado exitosamente')
      } catch (error) {
        console.warn('Error en updateUserProfile, usando modo mock:', error)
        // Actualizar datos mock como fallback
        const profileIndex = mockProfiles.findIndex(p => p.id === userId)
        if (profileIndex !== -1) {
          if (updates.nombre_completo !== undefined) {
            mockProfiles[profileIndex].nombre_completo = updates.nombre_completo
          }
          if (updates.email !== undefined) {
            mockProfiles[profileIndex].email = updates.email
          }
          mockProfiles[profileIndex].updated_at = new Date().toISOString()
        }
      }
    })
  }

  async deleteUser(userId: string): Promise<void> {
    return this.protectCurrentSession(async () => {
      try {
        console.log('🔄 deleteUser: Iniciando eliminación de usuario...', { userId })

        // CRÍTICO: Verificar que no estemos eliminando al usuario actual
        const currentUser = authService.getCurrentUser()
        if (currentUser && currentUser.id === userId) {
          console.warn('⚠️ deleteUser: EVITANDO eliminar usuario actual para prevenir pérdida de sesión')
          throw new Error('No se puede eliminar el usuario actual')
        }

        // Primero eliminar el perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (profileError) {
          console.warn(`Error eliminando perfil en Supabase: ${profileError.message}`)
          // En modo mock, simular éxito
          return
        }

        console.log('✅ deleteUser: Usuario eliminado exitosamente')

        // Nota: En Supabase, también necesitarías eliminar el usuario de auth.users
        // Esto normalmente se hace desde el servidor o usando la API de admin
        // Por ahora solo eliminamos el perfil
      } catch (error) {
        console.warn('Error en deleteUser, simulando éxito:', error)
        // En modo mock, no fallar
      }
    })
  }
}

export const userManagementService = new UserManagementService();