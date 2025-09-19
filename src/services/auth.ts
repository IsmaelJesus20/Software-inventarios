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
  private isCheckingAuth: boolean = false;
  private authCheckPromise: Promise<User | null> | null = null;

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
    // Prevent multiple simultaneous auth checks
    if (this.isCheckingAuth && this.authCheckPromise) {
      console.log('🔄 checkAuth: Verificación ya en curso, esperando...')
      return this.authCheckPromise
    }

    this.isCheckingAuth = true

    this.authCheckPromise = this.performAuthCheck()

    try {
      const result = await this.authCheckPromise
      return result
    } finally {
      this.isCheckingAuth = false
      this.authCheckPromise = null
    }
  }

  private async performAuthCheck(): Promise<User | null> {
    try {
      console.log('🔍 checkAuth: Iniciando verificación...')

      // Timeout para evitar requests colgados
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 10000) // 10 segundos
      })

      const sessionPromise = supabase.auth.getSession()
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ])

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

      // Si ya tenemos el usuario en memoria y es el mismo, devolverlo
      if (this.currentUser && this.currentUser.id === session.user.id) {
        console.log('📋 checkAuth: Usuario ya en memoria')
        return this.currentUser
      }

      console.log('🔍 checkAuth: Obteniendo perfil del usuario...')

      // Obtener el perfil del usuario con timeout
      const profileTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000) // 8 segundos
      })

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const { data: profile, error } = await Promise.race([
        profilePromise,
        profileTimeoutPromise
      ]) as any

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
        return ['admin_padre', 'admin'].includes(originalRole) // Admin padre y admin pueden editar descripción y stock mínimo
      case 'user_management':
        return originalRole === 'admin_padre' // Solo admin_padre puede gestionar usuarios
      default:
        return false
    }
  }

  // Método para escuchar cambios de autenticación
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 onAuthStateChange: Evento recibido:', event, {
        hasSession: !!session,
        userId: session?.user?.id
      })

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('🔔 onAuthStateChange: Procesando SIGNED_IN...')

          // Add timeout to prevent hanging
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout in auth state change')), 5000)
          })

          const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any

          if (!error && profile) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.nombre_completo || session.user.email?.split('@')[0] || 'Usuario',
              role: mapSupabaseRoleToAppRole(profile.role),
              originalRole: profile.role,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            }
            console.log('✅ onAuthStateChange: Usuario creado:', user)
            this.currentUser = user
            callback(user)
          } else {
            console.warn('⚠️ onAuthStateChange: Error obteniendo perfil:', error)
            // Create basic user on profile error to prevent app breaking
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.email?.split('@')[0] || 'Usuario',
              role: 'user',
              originalRole: 'tecnico',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            }
            this.currentUser = basicUser
            callback(basicUser)
          }
        } catch (error) {
          console.error('❌ onAuthStateChange: Error:', error)
          // Don't call callback(null) on error, just log it
          // This prevents unnecessary logout on temporary network issues
          console.warn('⚠️ onAuthStateChange: Manteniendo sesión debido a error temporal')
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 onAuthStateChange: Usuario desconectado')
        this.currentUser = null

        // Clear all caches when signing out
        if (typeof window !== 'undefined') {
          // Clear localStorage
          localStorage.clear()
          // Clear sessionStorage
          sessionStorage.clear()
        }

        callback(null)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 onAuthStateChange: Token renovado - manteniendo usuario actual')
        // Maintain current user state during token refresh to prevent loading states
        if (this.currentUser) {
          callback(this.currentUser)
        }
      } else {
        console.log('ℹ️ onAuthStateChange: Evento ignorado:', event)
      }
    })
  }
}

export const authService = new AuthService();