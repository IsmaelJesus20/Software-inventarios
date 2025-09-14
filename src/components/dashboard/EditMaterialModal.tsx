import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { Material } from '@/services/inventory';
import { supabase } from '@/lib/supabase';

interface EditMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  onSuccess?: () => void;
}

interface EditFormData {
  descripcion: string;
  categoria: string;
  ubicacion: string;
  stock_minimo: number;
  precio_unitario: number;
  unidad_medida: string;
}

const CATEGORIAS_PREDEFINIDAS = [
  'Repuestos',
  'Herramientas',
  'Consumibles',
  'Lubricantes',
  'Filtros',
  'Rodamientos',
  'Electrónicos',
  'Otros'
];

const UNIDADES_MEDIDA = [
  'unidad',
  'litros',
  'kilos',
  'metros',
  'cajas',
  'paquetes',
  'galones'
];

export const EditMaterialModal = ({ open, onOpenChange, material, onSuccess }: EditMaterialModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    descripcion: '',
    categoria: '',
    ubicacion: '',
    stock_minimo: 0,
    precio_unitario: 0,
    unidad_medida: 'unidad'
  });

  // Cargar datos del material cuando se abre el modal
  useEffect(() => {
    if (open && material) {
      setFormData({
        descripcion: material.name,
        categoria: material.category,
        ubicacion: material.location,
        stock_minimo: material.minStock,
        precio_unitario: 0, // No tenemos este dato en el tipo Material actual
        unidad_medida: 'unidad' // Valor por defecto
      });
    }
  }, [open, material]);

  const handleChange = (field: keyof EditFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'stock_minimo' || field === 'precio_unitario'
      ? parseFloat(e.target.value) || 0
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof EditFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    if (!material) {
      toast({
        title: "Error",
        description: "No hay material seleccionado",
        variant: "destructive"
      });
      return;
    }

    // Validaciones básicas
    if (!formData.descripcion.trim()) {
      toast({
        title: "Error de validación",
        description: "La descripción es obligatoria",
        variant: "destructive"
      });
      return;
    }

    if (formData.stock_minimo < 0) {
      toast({
        title: "Error de validación",
        description: "El stock mínimo no puede ser negativo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Actualizar directamente en Supabase (solo admin_padre puede hacer esto)
      const { error } = await supabase
        .from('inventory_items')
        .update({
          descripcion: formData.descripcion,
          categoria: formData.categoria || null,
          ubicacion: formData.ubicacion || null,
          stock_minimo: formData.stock_minimo,
          precio_unitario: formData.precio_unitario || null,
          unidad_medida: formData.unidad_medida,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', material.id);

      if (error) {
        throw new Error(`Error actualizando material: ${error.message}`);
      }

      toast({
        title: "¡Material actualizado exitosamente!",
        description: `${formData.descripcion} ha sido modificado`,
      });

      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error editando material:', error);
      toast({
        title: "Error al editar material",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Editar Material</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Material Actual */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Código:</span>
                  <span className="ml-2 text-blue-700 font-mono">{material.codigo}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Stock Actual:</span>
                  <span className="ml-2 text-blue-700 font-bold">{material.currentStock}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Creado:</span>
                  <span className="ml-2 text-blue-700">{material.createdAt.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Actualizado:</span>
                  <span className="ml-2 text-blue-700">{material.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Básica */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Información Básica</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción / Nombre *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange('descripcion')}
                  placeholder="Nombre o descripción del material"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={handleSelectChange('categoria')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PREDEFINIDAS.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange('ubicacion')}
                    placeholder="Ej: Almacén A - Estante 3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Stock y Precios */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-3">Configuración de Stock y Precios</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock_minimo}
                  onChange={handleChange('stock_minimo')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_unitario">Precio Unitario</Label>
                <Input
                  id="precio_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={handleChange('precio_unitario')}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad_medida">Unidad de Medida</Label>
                <Select value={formData.unidad_medida} onValueChange={handleSelectChange('unidad_medida')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map(unidad => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};