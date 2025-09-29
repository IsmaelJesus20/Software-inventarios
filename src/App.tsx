import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { useIdleTimer } from "@/hooks/useIdleTimer";

// Pages
import Login from "./pages/Login";
import Technical from "./pages/Technical";
import UserManagement from "./pages/UserManagement";
import ModifyStock from "./pages/ModifyStock";
import NotFound from "./pages/NotFound";
import NetworkTest from "./pages/NetworkTest";

// Components
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Configure React Query with better defaults for preventing loading issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent refetching on window focus to avoid unnecessary loading
      refetchOnWindowFocus: false,
      // Prevent refetching on reconnect unless necessary
      refetchOnReconnect: true,
      // Increase stale time to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Set cache time
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations with exponential backoff
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function AppContent() {
  // Manejar inactividad para prevenir problemas de sesión
  useIdleTimer({
    timeout: 600000, // 10 minutos
    onIdle: () => {
      console.log('🕐 Usuario inactivo - preparando para revalidar sesión');
      // Limpiar cache de queries cuando el usuario esté inactivo
      queryClient.invalidateQueries();
    },
    onActive: () => {
      console.log('✨ Usuario activo - revalidando datos');
      // Revalidar datos importantes cuando el usuario vuelva a estar activo
      queryClient.refetchQueries();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Technical />
          </ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/modify-stock" element={
          <ProtectedRoute>
            <ModifyStock />
          </ProtectedRoute>
        } />
        <Route path="/modify-stock/:materialId" element={
          <ProtectedRoute>
            <ModifyStock />
          </ProtectedRoute>
        } />
        <Route path="/network-test" element={<NetworkTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;