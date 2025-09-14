import { supabase } from '@/lib/supabase'
import { mapSupabaseRoleToAppRole, type SupabaseProfile } from '@/types/database'

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  originalRole: string; // Para mostrar el rol real de Supabase
  avatar?: string;
}

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('No se pudo obtener información del usuario')
      }

      // Obtener el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        throw new Error('No se pudo obtener el perfil del usuario')
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: profile.nombre_completo || data.user.email?.split('@')[0] || 'Usuario',
        role: mapSupabaseRoleToAppRole(profile.role),
        originalRole: profile.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`
      }

      this.currentUser = user
      return user
    } catch (error) {
      console.error('Error en login:', error)
      throw error instanceof Error ? error : new Error('Error desconocido en el login')
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      this.currentUser = null
    } catch (error) {
      console.error('Error en logout:', error)
      throw error instanceof Error ? error : new Error('Error desconocido en el logout')
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async checkAuth(): Promise<User | null> {
    try {
      console.log('🔍 checkAuth: Iniciando verificación...')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      console.log('🔍 checkAuth: Sesión obtenida:', { session: !!session, error: sessionError })

      if (sessionError) {
        console.error('❌ checkAuth: Error obteniendo sesión:', sessionError)
        this.currentUser = null
        return null
      }

      if (!session?.user) {
        console.log('ℹ️ checkAuth: No hay sesión activa')
        this.currentUser = null
        return null
      }

      console.log('✅ checkAuth: Usuario en sesión:', session.user.id)

      // Si ya tenemos el usuario en memoria, devolverlo
      if (this.currentUser && this.currentUser.id === session.user.id) {
        console.log('📋 checkAuth: Usuario ya en memoria')
        return this.currentUser
      }

      console.log('🔍 checkAuth: Obteniendo perfil del usuario...')

      // Obtener el perfil del usuario
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 checkAuth: Respuesta perfil:', { profile, error })

      if (error) {
        console.error('❌ checkAuth: Error obteniendo perfil:', error)
        // En lugar de fallar, crear usuario básico sin perfil
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'Usuario',
          role: 'user', // rol por defecto
          originalRole: 'tecnico', // rol original por defecto
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        }
        this.currentUser = basicUser
        console.log('⚠️ checkAuth: Usuario básico creado sin perfil')
        return basicUser
      }

      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: profile.nombre_completo || session.user.email?.split('@')[0] || 'Usuario',
        role: mapSupabaseRoleToAppRole(profile.role),
        originalRole: profile.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
      }

      console.log('✅ checkAuth: Usuario completo creado:', user)
      this.currentUser = user
      return user
    } catch (error) {
      console.error('❌ checkAuth: Error general:', error)
      this.currentUser = null
      return null
    }
  }

  hasPermission(permission: 'read' | 'write' | 'admin' | 'admin_padre' | 'edit_materials' | 'user_management'): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Verificar permisos basado en el rol original de Supabase
    const originalRole = user.originalRole

    switch (permission) {
      case 'read':
        return ['admin_padre', 'admin', 'tecnico'].includes(originalRole)
      case 'write':
        return ['admin_padre', 'admin', 'tecnico'].includes(originalRole)
      case 'admin':
        return ['admin_padre', 'admin'].includes(originalRole)
      case 'admin_padre':
        return originalRole === 'admin_padre'
      case 'edit_materials':
        return originalRole === 'admin_padre' // Solo admin_padre puede editar descripción y stock mínimo
      case 'user_management':
        return originalRole === 'admin_padre' // Solo admin_padre puede gestionar usuarios
      default:
        return false
    }
  }

  // Método para escuchar cambios de autenticación
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && profile) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.nombre_completo || session.user.email?.split('@')[0] || 'Usuario',
              role: mapSupabaseRoleToAppRole(profile.role),
              originalRole: profile.role,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            }
            this.currentUser = user
            callback(user)
          }
        } catch (error) {
          console.error('Error en onAuthStateChange:', error)
          callback(null)
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        callback(null)
      }
    })
  }
}

export const authService = new AuthService();