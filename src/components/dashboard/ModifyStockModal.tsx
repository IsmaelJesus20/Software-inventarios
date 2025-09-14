import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Plus, Minus, Package, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { n8nService } from '@/services/n8n';
import { toast } from '@/components/ui/use-toast';
import type { Material } from '@/services/inventory';

interface ModifyStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface StockFormData {
  material_id: string;
  material_name: string;
  current_stock: number;
  tipo_operacion: 'increase' | 'decrease';
  cantidad: number;
  comentario: string;
}

export const ModifyStockModal = ({ open, onOpenChange, onSuccess }: ModifyStockModalProps) => {
  const { user } = useAuth();
  const { materials, searchMaterials } = useInventory();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    material_id: '',
    material_name: '',
    current_stock: 0,
    tipo_operacion: 'increase',
    cantidad: 1,
    comentario: ''
  });

  // Buscar materiales cuando cambie la query
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const results = await searchMaterials(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Error buscando materiales:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults(materials.slice(0, 10)); // Mostrar los primeros 10 por defecto
      }
    };

    if (open) { // Solo buscar si el modal está abierto
      performSearch();
    }
  }, [searchQuery, materials, open]); // Removí searchMaterials de las dependencias

  // Resetear formulario al abrir/cerrar modal
  useEffect(() => {
    if (open) {
      setSearchResults(materials.slice(0, 10));
    } else {
      // Resetear todo al cerrar
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMaterial(null);
      setFormData({
        material_id: '',
        material_name: '',
        current_stock: 0,
        tipo_operacion: 'increase',
        cantidad: 1,
        comentario: ''
      });
    }
  }, [open, materials]);

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterial(material);
    setFormData(prev => ({
      ...prev,
      material_id: material.id,
      material_name: material.name,
      current_stock: material.currentStock
    }));
  };

  const handleChange = (field: keyof StockFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'cantidad' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOperationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipo_operacion: value as 'increase' | 'decrease'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return;
    }

    // Validaciones básicas
    if (!selectedMaterial) {
      toast({
        title: "Error de validación",
        description: "Debes seleccionar un material",
        variant: "destructive"
      });
      return;
    }

    if (formData.cantidad <= 0) {
      toast({
        title: "Error de validación",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.tipo_operacion === 'decrease' && formData.cantidad > formData.current_stock) {
      toast({
        title: "Error de validación",
        description: "No puedes retirar más stock del disponible",
        variant: "destructive"
      });
      return;
    }

    if (!formData.comentario.trim()) {
      toast({
        title: "Error de validación",
        description: "El comentario es obligatorio",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let response;

      if (formData.tipo_operacion === 'increase') {
        response = await n8nService.increaseStock({
          item_id: formData.material_id,
          cantidad: formData.cantidad,
          comment: formData.comentario,
          usuario_id: user.id,
          usuario_email: user.email || ''
        });
      } else {
        response = await n8nService.decreaseStock({
          item_id: formData.material_id,
          cantidad: formData.cantidad,
          comment: formData.comentario,
          usuario_id: user.id,
          usuario_email: user.email || ''
        });
      }

      if (response.status === 'success') {
        const operationText = formData.tipo_operacion === 'increase' ? 'aumentado' : 'reducido';
        toast({
          title: `¡Stock ${operationText} exitosamente!`,
          description: `${formData.material_name}: ${formData.tipo_operacion === 'increase' ? '+' : '-'}${formData.cantidad} unidades`,
        });

        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Error modificando stock:', error);
      toast({
        title: "Error al modificar stock",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5" />
            <span>Modificar Stock</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Búsqueda y Selección de Material */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Seleccionar Material</h4>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar Material</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, código o categoría..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lista de materiales */}
              <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
                {searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((material) => (
                      <div
                        key={material.id}
                        className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedMaterial?.id === material.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleMaterialSelect(material)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{material.name}</p>
                            <p className="text-xs text-gray-500">
                              {material.codigo} • {material.category} • {material.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Stock: {material.currentStock}</p>
                            <p className="text-xs text-gray-500">Mín: {material.minStock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron materiales</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Material Seleccionado y Operación */}
          {selectedMaterial && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">Material Seleccionado</h4>

              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{selectedMaterial.name}</h5>
                      <p className="text-sm text-gray-600">{selectedMaterial.codigo}</p>
                      <p className="text-sm text-gray-600">{selectedMaterial.category} • {selectedMaterial.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{selectedMaterial.currentStock}</p>
                      <p className="text-xs text-gray-500">Stock Actual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_operacion">Tipo de Operación *</Label>
                  <Select value={formData.tipo_operacion} onValueChange={handleOperationChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          <span>Aumentar Stock</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="decrease">
                        <div className="flex items-center space-x-2">
                          <Minus className="h-4 w-4 text-red-600" />
                          <span>Reducir Stock</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.cantidad}
                    onChange={handleChange('cantidad')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stock Resultante</Label>
                  <div className="p-2 bg-white border rounded-md text-center">
                    <span className={`font-bold text-lg ${
                      formData.tipo_operacion === 'increase' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {formData.tipo_operacion === 'increase'
                        ? formData.current_stock + formData.cantidad
                        : formData.current_stock - formData.cantidad
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comentario */}
          {selectedMaterial && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Información de la Operación</h4>
              <div className="space-y-2">
                <Label htmlFor="comentario">Comentario / Motivo *</Label>
                <Textarea
                  id="comentario"
                  value={formData.comentario}
                  onChange={handleChange('comentario')}
                  placeholder="Describe el motivo de la modificación del stock..."
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedMaterial}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modificando...
                </>
              ) : (
                <>
                  {formData.tipo_operacion === 'increase' ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Minus className="mr-2 h-4 w-4" />
                  )}
                  {formData.tipo_operacion === 'increase' ? 'Aumentar Stock' : 'Reducir Stock'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};