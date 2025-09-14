import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Package, AlertTriangle, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Material } from '@/services/inventory';

interface InventoryTableProps {
  materials: Material[];
  onViewMaterial?: (materialId: string) => void;
  onEditMaterial?: (materialId: string) => void;
}

export const InventoryTable = ({ materials, onViewMaterial, onEditMaterial }: InventoryTableProps) => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Obtener categorías únicas
  const categories = Array.from(new Set(materials.map(m => m.category)));

  // Filtrar materiales
  const filteredMaterials = materials.filter(material => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'critical') {
      matchesStatus = material.currentStock === 0;
    } else if (statusFilter === 'low') {
      matchesStatus = material.currentStock <= material.minStock && material.currentStock > 0;
    } else if (statusFilter === 'normal') {
      matchesStatus = material.currentStock > material.minStock;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (material: Material) => {
    if (material.currentStock === 0) {
      return { status: 'critical', label: 'Sin Stock', variant: 'destructive' as const };
    } else if (material.currentStock <= material.minStock) {
      return { status: 'low', label: 'Stock Bajo', variant: 'outline' as const };
    } else {
      return { status: 'normal', label: 'Normal', variant: 'outline' as const };
    }
  };

  const getStockColor = (material: Material) => {
    if (material.currentStock === 0) return 'text-red-600';
    if (material.currentStock <= material.minStock) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Inventario Completo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, código o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado del stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="critical">Sin Stock</SelectItem>
              <SelectItem value="low">Stock Bajo</SelectItem>
              <SelectItem value="normal">Stock Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumen de filtros */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredMaterials.length} de {materials.length} materiales
          </p>
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron materiales</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {material.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {material.currentStock === 0 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{material.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {material.location}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getStockColor(material)}`}>
                        {material.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {material.minStock}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={stockStatus.variant}
                          className={stockStatus.status === 'low' ? 'text-yellow-700 border-yellow-700' : ''}
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewMaterial?.(material.id)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('edit_materials') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditMaterial?.(material.id)}
                              title="Editar material (solo admin_padre)"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};