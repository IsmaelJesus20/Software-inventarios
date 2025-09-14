import { useState, useEffect } from 'react';
import { authService, type User } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log('🔄 useAuth: Iniciando verificación...')
        setLoading(true);
        setError(null);

        const currentUser = await authService.checkAuth();

        if (isMounted) {
          console.log('👤 useAuth: Usuario obtenido:', currentUser)
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Error de autenticación';
          console.error('❌ useAuth: Error:', errorMsg)
          setError(errorMsg);
        }
      } finally {
        if (isMounted) {
          console.log('✅ useAuth: Verificación completada')
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (isMounted) {
        console.log('🔔 useAuth: Cambio de estado auth:', user)
        setUser(user);
        setLoading(false);
        if (!user) {
          setError(null); // Limpiar errores al hacer logout
          // Limpiar cache de inventario al cerrar sesión - se limpiará automáticamente al recargar
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      // No necesitamos setLoading ni setUser aquí porque onAuthStateChange se encargará
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
    }
  };

  const hasPermission = (permission: 'read' | 'write' | 'admin'): boolean => {
    return authService.hasPermission(permission);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
  };
};