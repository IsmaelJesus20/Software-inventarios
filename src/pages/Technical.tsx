import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { MovementsTable } from '@/components/dashboard/MovementsTable';
import { CreateMaterialModal } from '@/components/dashboard/CreateMaterialModal';
import { EditMaterialModal } from '@/components/dashboard/EditMaterialModal';
import { MaterialDetailsModal } from '@/components/dashboard/MaterialDetailsModal';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { Package, LogOut, Home, Wrench, Database, BarChart3, Settings2, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Technical = () => {
  const { user, logout, hasPermission } = useAuth();
  const { materials, movements, loading, getStats, refreshData } = useInventory();
  const navigate = useNavigate();
  const [createMaterialModalOpen, setCreateMaterialModalOpen] = useState(false);
  const [editMaterialModalOpen, setEditMaterialModalOpen] = useState(false);
  const [materialDetailsModalOpen, setMaterialDetailsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleViewMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setSelectedMaterial(material);
      setMaterialDetailsModalOpen(true);
    }
  };

  const handleEditMaterial = (materialId: string) => {
    if (!hasPermission('edit_materials')) {
      toast({
        title: "Permisos insuficientes",
        description: "Solo admin padre y admin pueden editar materiales",
        variant: "destructive",
      });
      return;
    }

    const material = materials.find(m => m.id === materialId);
    if (material) {
      setSelectedMaterial(material);
      setEditMaterialModalOpen(true);
    }
  };

  const handleShowQR = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setSelectedMaterial(material);
      setQrModalOpen(true);
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos técnicos...</p>
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
              <p className="text-sm text-gray-600">Vista Técnica</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Gestión</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Historial de movimientos</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings2 className="h-4 w-4" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Inventario Completo */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryTable
              materials={materials}
              onViewMaterial={handleViewMaterial}
              onEditMaterial={handleEditMaterial}
              onShowQR={handleShowQR}
            />
          </TabsContent>

          {/* Análisis y Reportes */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              {/* Estadísticas Detalladas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Detalladas del Inventario</CardTitle>
                  <CardDescription>
                    Análisis completo del estado actual del inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalMaterials}</div>
                      <div className="text-sm text-muted-foreground">Total Materiales</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.lowStock}</div>
                      <div className="text-sm text-muted-foreground">Stock Bajo</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-red-600 mb-2">{stats.criticalStock}</div>
                      <div className="text-sm text-muted-foreground">Sin Stock</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">{movements.length}</div>
                      <div className="text-sm text-muted-foreground">Movimientos Totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Análisis por Categorías */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis por Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Leyenda de símbolos */}
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Leyenda:</h5>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600 font-medium">✓</span>
                        <span className="text-gray-600">Normales (stock suficiente)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-600 font-medium">⚠</span>
                        <span className="text-gray-600">Bajos (stock bajo mínimo)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-red-600 font-medium">✗</span>
                        <span className="text-gray-600">Críticos (sin stock)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.from(new Set(materials.map(m => m.category))).map((category) => {
                      const categoryMaterials = materials.filter(m => m.category === category);
                      const totalValue = categoryMaterials.reduce((sum, m) => sum + m.currentStock, 0);
                      const criticalCount = categoryMaterials.filter(m => m.currentStock === 0).length;
                      const lowStockCount = categoryMaterials.filter(m => m.currentStock <= m.minStock && m.currentStock > 0).length;

                      return (
                        <div key={category} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{category}</h4>
                            <div className="text-right">
                              <div className="text-sm font-medium">{categoryMaterials.length} items</div>
                              <div className="text-xs text-muted-foreground">{totalValue} unidades</div>
                            </div>
                          </div>
                          <div className="flex space-x-4 text-sm">
                            <span className="text-green-600">✓ {categoryMaterials.length - criticalCount - lowStockCount} Normales</span>
                            {lowStockCount > 0 && <span className="text-yellow-600">⚠ {lowStockCount} Bajos</span>}
                            {criticalCount > 0 && <span className="text-red-600">✗ {criticalCount} Críticos</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Gestión de Materiales */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Herramientas de Gestión */}
              <Card>
                <CardHeader>
                  <CardTitle>Herramientas de Gestión</CardTitle>
                  <CardDescription>
                    Acciones principales para la gestión del inventario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    disabled={!hasPermission('write')}
                    onClick={() => setCreateMaterialModalOpen(true)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Crear Nuevo Material
                  </Button>
                  {hasPermission('write') ? (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      asChild
                    >
                      <Link to="/modify-stock">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Modificar Stock
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      disabled={true}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Modificar Stock
                    </Button>
                  )}
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={!hasPermission('write')}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Ajuste Masivo de Inventario
                  </Button>
                  {!hasPermission('write') && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Permisos limitados:</strong> Solo puedes ver el inventario. 
                        Contacta al administrador para obtener permisos de escritura.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información de Permisos */}
              <Card>
                <CardHeader>
                  <CardTitle>Tu Acceso al Sistema</CardTitle>
                  <CardDescription>
                    Información sobre tus permisos actuales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Rol Actual</span>
                        <span className="capitalize font-medium text-blue-600">{user?.role}</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Lectura de Datos</span>
                        <span className="text-green-600">✓ Permitido</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Modificar Inventario</span>
                        <span className={hasPermission('write') ? 'text-green-600' : 'text-red-600'}>
                          {hasPermission('write') ? '✓ Permitido' : '✗ Denegado'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Administración</span>
                        <span className={hasPermission('admin') ? 'text-green-600' : 'text-red-600'}>
                          {hasPermission('admin') ? '✓ Permitido' : '✗ Denegado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historial de movimientos */}
          <TabsContent value="movements" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Historial Completo de Movimientos</span>
                  </CardTitle>
                  <CardDescription>
                    Registro detallado de todos los movimientos de inventario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{movements.length}</div>
                      <div className="text-sm text-blue-700">Movimientos Totales</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {movements.filter(m => m.type === 'increase').length}
                      </div>
                      <div className="text-sm text-green-700">Entradas</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {movements.filter(m => m.type === 'decrease').length}
                      </div>
                      <div className="text-sm text-red-700">Salidas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla completa de movimientos */}
              <MovementsTable movements={movements} />
            </div>
          </TabsContent>

          {/* Estado del Sistema */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Información técnica y diagnósticos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Base de Datos</h4>
                    <p className="text-sm text-green-600 mb-1">🟢 Supabase - Operativo</p>
                    <p className="text-xs text-gray-500">{materials.length} materiales, {movements.length} movimientos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Autenticación</h4>
                    <p className="text-sm text-green-600 mb-1">🟢 Supabase Auth - Activo</p>
                    <p className="text-xs text-gray-500">Usuarios reales configurados</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">APIs Externas</h4>
                    <p className="text-sm text-yellow-600 mb-1">🟡 Pendiente Configuración</p>
                    <p className="text-xs text-gray-500">Ver FUTURE_MODIFICATIONS.md</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Entorno</h4>
                    <p className="text-sm text-blue-600 mb-1">🔧 Desarrollo/Prototipo</p>
                    <p className="text-xs text-gray-500">Versión 1.0.0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Chat IA</h4>
                    <p className="text-sm text-orange-600 mb-1">🟡 Modo Local</p>
                    <p className="text-xs text-gray-500">Respuestas predefinidas activas</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Webhooks</h4>
                    <p className="text-sm text-gray-400 mb-1">⭕ Deshabilitado</p>
                    <p className="text-xs text-gray-500">Configurar para producción</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para crear material */}
        <CreateMaterialModal
          open={createMaterialModalOpen}
          onOpenChange={setCreateMaterialModalOpen}
          onSuccess={() => {
            // Refrescar los datos después de crear un material con un pequeño delay
            setTimeout(() => {
              refreshData();
            }, 1000);
          }}
        />

        {/* Modal para editar material (solo admin_padre) */}
        <EditMaterialModal
          open={editMaterialModalOpen}
          onOpenChange={setEditMaterialModalOpen}
          material={selectedMaterial}
          onSuccess={() => {
            // Refrescar los datos después de editar material
            setTimeout(() => {
              refreshData();
            }, 1000);
            setSelectedMaterial(null);
          }}
        />

        {/* Modal para ver detalles del material */}
        <MaterialDetailsModal
          open={materialDetailsModalOpen}
          onOpenChange={(open) => {
            setMaterialDetailsModalOpen(open);
            if (!open) {
              setSelectedMaterial(null);
            }
          }}
          material={selectedMaterial}
        />

        {/* Modal para generar QR */}
        {selectedMaterial && (
          <QRCodeGenerator
            material={selectedMaterial}
            isOpen={qrModalOpen}
            onClose={() => {
              setQrModalOpen(false);
              setSelectedMaterial(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Technical;