import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { userManagementService, type UserProfile } from '@/services/userManagement'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, Edit2, Trash2, ArrowLeft, AlertTriangle, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const UserManagement = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre_completo: '',
    email: '',
    role: 'tecnico' as 'admin_padre' | 'admin' | 'tecnico'
  })

  // Verificación de permisos estable usando el rol directamente
  const canManageUsers = user?.originalRole === 'admin_padre'

  useEffect(() => {
    if (!user) return

    if (user.originalRole !== 'admin_padre') {
      navigate('/', { replace: true })
      return
    }

    // Cargar profiles directamente en el useEffect
    const loadData = async () => {
      try {
        console.log('🔄 UserManagement: Iniciando carga de perfiles...')
        console.log('🔄 UserManagement: Usuario antes de cargar:', user?.email, user?.originalRole)

        setLoading(true)
        setError(null)
        const data = await userManagementService.getAllProfiles()

        console.log('✅ UserManagement: Perfiles cargados:', data.length)
        console.log('🔄 UserManagement: Usuario después de cargar:', user?.email, user?.originalRole)

        setProfiles(data)
      } catch (err) {
        console.error('❌ UserManagement: Error cargando perfiles:', err)
        const errorMsg = err instanceof Error ? err.message : 'Error cargando usuarios'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, user?.originalRole])

  // Función separada para reload (usada en botones)
  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userManagementService.getAllProfiles()
      setProfiles(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error cargando usuarios'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  // Si no hay usuario aún, mostrar loading
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando usuario...</p>
        </div>
      </div>
    )
  }

  // Si el usuario no tiene permisos, mostrar mensaje breve antes de redirigir
  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  const handleEditUser = (profile: UserProfile) => {
    setEditingUser(profile)
    setEditForm({
      nombre_completo: profile.nombre_completo || '',
      email: profile.email || '',
      role: profile.role
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      // Buscar el usuario actual del array para comparar con datos actualizados
      const currentUserData = profiles.find(p => p.id === editingUser.id)

      // Actualizar perfil
      await userManagementService.updateUserProfile(editingUser.id, {
        nombre_completo: editForm.nombre_completo,
        email: editForm.email
      })

      // Actualizar rol si cambió (usando datos actualizados, no obsoletos)
      if (editForm.role !== currentUserData?.role) {
        await userManagementService.updateUserRole(editingUser.id, editForm.role)
      }

      toast.success('Usuario actualizado correctamente')

      // Cerrar el dialog y limpiar estado
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditForm({
        nombre_completo: '',
        email: '',
        role: 'tecnico' as 'admin_padre' | 'admin' | 'tecnico'
      })

      await loadProfiles()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error actualizando usuario'
      toast.error(errorMsg)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await userManagementService.deleteUser(userId)
      toast.success(`Usuario ${userName} eliminado correctamente`)
      await loadProfiles()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error eliminando usuario'
      toast.error(errorMsg)
    }
  }

  // Loading state interno del componente
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error de Conexión</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadProfiles}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin_padre':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'tecnico':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin_padre':
        return 'Admin Padre'
      case 'admin':
        return 'Admin'
      case 'tecnico':
        return 'Técnico'
      default:
        return role
    }
  }

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
              <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-600">Administración de perfiles y roles</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <Package className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Usuarios del Sistema</span>
            </CardTitle>
            <CardDescription>
              Gestiona los usuarios, roles y permisos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-sm">{profile.nombre_completo}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                      <Badge variant={getRoleBadgeVariant(profile.role)}>
                        {getRoleDisplayName(profile.role)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creado: {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(profile)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={profile.id === user?.id} // No permitir auto-eliminación
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar al usuario ${profile.nombre_completo}? Esta acción no se puede deshacer.`)) {
                          handleDeleteUser(profile.id, profile.nombre_completo)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {profiles.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de edición único y reutilizable */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false)
          setEditingUser(null)
          setEditForm({
            nombre_completo: '',
            email: '',
            role: 'tecnico' as 'admin_padre' | 'admin' | 'tecnico'
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información y rol del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={editForm.nombre_completo}
                onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: 'admin_padre' | 'admin' | 'tecnico') =>
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_padre">Admin Padre</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingUser(null)
              setEditForm({
                nombre_completo: '',
                email: '',
                role: 'tecnico' as 'admin_padre' | 'admin' | 'tecnico'
              })
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagement