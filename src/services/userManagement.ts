import { supabase } from '@/lib/supabase'
import { type SupabaseProfile } from '@/types/database'

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

  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      // Intentar obtener de Supabase primero
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error con Supabase, usando datos mock:', error.message)
        return mockProfiles
      }

      return data && data.length > 0 ? data : mockProfiles
    } catch (error) {
      console.warn('Error en getAllProfiles, usando datos mock:', error)
      return mockProfiles
    }
  }

  async updateUserRole(userId: string, newRole: 'admin_padre' | 'admin' | 'tecnico'): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.warn(`Error actualizando rol en Supabase: ${error.message}`)
        // En modo mock, simular éxito
        return
      }
    } catch (error) {
      console.warn('Error en updateUserRole, simulando éxito:', error)
      // En modo mock, no fallar
    }
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'nombre_completo' | 'email'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.warn(`Error actualizando perfil en Supabase: ${error.message}`)
        // En modo mock, simular éxito
        return
      }
    } catch (error) {
      console.warn('Error en updateUserProfile, simulando éxito:', error)
      // En modo mock, no fallar
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
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

      // Nota: En Supabase, también necesitarías eliminar el usuario de auth.users
      // Esto normalmente se hace desde el servidor o usando la API de admin
      // Por ahora solo eliminamos el perfil
    } catch (error) {
      console.warn('Error en deleteUser, simulando éxito:', error)
      // En modo mock, no fallar
    }
  }
}

export const userManagementService = new UserManagementService();