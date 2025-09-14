import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const UserManagementSimple = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios - SIMPLE</h1>
              <p className="text-sm text-gray-600">Página de prueba</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">¡Navegación Exitosa!</h2>
          <p className="text-muted-foreground mb-4">
            Si ves esta página, la navegación funciona correctamente.
          </p>
          <p className="text-sm text-muted-foreground">
            Usuario actual: {user?.email} ({user?.originalRole})
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserManagementSimple