import { useState, useEffect, useCallback, useRef } from 'react';
import { authService, type User } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const authCheckPromiseRef = useRef<Promise<void> | null>(null);

  // Memoized state update function to prevent race conditions
  const updateState = useCallback((newUser: User | null, isLoading: boolean, newError: string | null = null) => {
    if (!isMountedRef.current) return;

    setUser(newUser);
    setLoading(isLoading);
    setError(newError);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let subscription: any = null;

    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (authCheckPromiseRef.current) {
        return authCheckPromiseRef.current;
      }

      try {
        console.log('🔄 useAuth: Iniciando verificación...');
        updateState(null, true, null);

        const authPromise = authService.checkAuth();
        authCheckPromiseRef.current = authPromise.then(() => {});

        const currentUser = await authPromise;

        if (isMountedRef.current) {
          console.log('👤 useAuth: Usuario obtenido:', currentUser);
          updateState(currentUser, false, null);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMsg = err instanceof Error ? err.message : 'Error de autenticación';
          console.error('❌ useAuth: Error:', errorMsg);
          updateState(null, false, errorMsg);
        }
      } finally {
        authCheckPromiseRef.current = null;
        if (isMountedRef.current) {
          console.log('✅ useAuth: Verificación completada');
        }
      }
    };

    // Initialize auth check
    checkAuth();

    // Setup auth state listener with debounced updates
    let authStateTimeout: NodeJS.Timeout | null = null;

    const { data: { subscription: authSubscription } } = authService.onAuthStateChange((newUser) => {
      if (!isMountedRef.current) return;

      // Debounce auth state changes to prevent rapid updates
      if (authStateTimeout) {
        clearTimeout(authStateTimeout);
      }

      authStateTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          console.log('🔔 useAuth: Cambio de estado auth:', newUser);
          updateState(newUser, false, newUser ? null : null);
        }
      }, 100);
    });

    subscription = authSubscription;

    return () => {
      isMountedRef.current = false;
      authCheckPromiseRef.current = null;

      if (authStateTimeout) {
        clearTimeout(authStateTimeout);
      }

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array is correct here

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

      // Limpiar cache antes del logout
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('inventory') || name.includes('auth')) {
              caches.delete(name);
            }
          });
        });
      }

      await authService.logout();
      // No necesitamos setLoading ni setUser aquí porque onAuthStateChange se encargará
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
    }
  };

  const hasPermission = (permission: 'read' | 'write' | 'admin' | 'admin_padre' | 'edit_materials' | 'user_management'): boolean => {
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