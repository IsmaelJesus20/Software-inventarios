import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, LogOut, Settings, BarChart3, AlertTriangle, TrendingUp, Activity, Clock, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { materials, movements, loading, error, getStats } = useInventory();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const stats = getStats();
  const categories = Array.from(new Set(materials.map(m => m.category)));
  
  // Materiales críticos (sin stock)
  const criticalMaterials = materials.filter(m => m.currentStock === 0);
  
  // Materiales con stock bajo
  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minStock && m.currentStock > 0);
  
  // Movimientos de hoy
  const todayMovements = movements.filter(m => {
    const today = new Date();
    const movementDate = new Date(m.timestamp);
    return movementDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error de Conexión</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SaaS Inventory</h1>
              <p className="text-sm text-gray-600">Dashboard Principal</p>
            </div>
            {/* Botón de Gestión de Usuarios - Solo para admin_padre */}
            {user?.originalRole === 'admin_padre' && (
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => {
                  console.log('Admin padre navegando a /user-management...');
                  navigate('/user-management');
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Gestión de Usuarios
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/technical">
                <Settings className="h-4 w-4 mr-2" />
                Vista Técnica
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Estadísticas Generales - PRIMERO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Materiales</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde el mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">
                  Requiere reposición
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.criticalStock}</div>
                <p className="text-xs text-muted-foreground">
                  Reposición urgente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayMovements.length}</div>
                <p className="text-xs text-muted-foreground">
                  Actividad del día
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas Críticas - SEGUNDO (justo debajo) */}
          {(criticalMaterials.length > 0 || lowStockMaterials.length > 0) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center space-x-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alertas de Stock</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Sin Stock aparece PRIMERO */}
                {criticalMaterials.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2 text-sm">Sin Stock (Crítico)</h4>
                    <div className="grid gap-2">
                      {criticalMaterials.slice(0, 2).map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="font-medium text-sm">{material.name}</p>
                            <p className="text-xs text-muted-foreground">{material.location}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">Sin Stock</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Bajo aparece DESPUÉS */}
                {lowStockMaterials.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2 text-sm">Stock Bajo</h4>
                    <div className="grid gap-2">
                      {lowStockMaterials.slice(0, 2).map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="font-medium text-sm">{material.name}</p>
                            <p className="text-xs text-muted-foreground">{material.location}</p>
                          </div>
                          <Badge variant="outline" className="text-yellow-700 border-yellow-700 text-xs">
                            {material.currentStock} / {material.minStock}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actividad Reciente y Categorías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
                <CardDescription>Últimos movimientos de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {movements.slice(0, 5).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{movement.materialName}</p>
                        <p className="text-xs text-muted-foreground">{movement.comment}</p>
                        <p className="text-xs text-muted-foreground">Por: {movement.responsible}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={movement.type === 'increase' ? 'default' : movement.type === 'decrease' ? 'secondary' : 'outline'}>
                          {movement.type === 'increase' ? '+' : movement.type === 'decrease' ? '' : ''}
                          {movement.quantity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(movement.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Categorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Categorías del Inventario</span>
                </CardTitle>
                <CardDescription>Distribución de materiales por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const categoryMaterials = materials.filter(m => m.category === category);
                    const categoryValue = categoryMaterials.reduce((sum, m) => sum + m.currentStock, 0);
                    const criticalInCategory = categoryMaterials.filter(m => m.currentStock === 0).length;
                    const lowStockInCategory = categoryMaterials.filter(m => m.currentStock <= m.minStock && m.currentStock > 0).length;

                    return (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{category}</p>
                          <p className="text-xs text-muted-foreground">
                            {categoryMaterials.length} items • {categoryValue} unidades
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {criticalInCategory > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {criticalInCategory} sin stock
                            </Badge>
                          )}
                          {lowStockInCategory > 0 && (
                            <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-700">
                              {lowStockInCategory} bajo
                            </Badge>
                          )}
                          {criticalInCategory === 0 && lowStockInCategory === 0 && (
                            <Badge variant="outline" className="text-xs text-green-700 border-green-700">
                              OK
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;