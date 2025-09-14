import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { n8nService } from '@/services/n8n';
import { toast } from '@/components/ui/use-toast';

interface CreateMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface MaterialFormData {
  nombre: string;
  codigo: string;
  categoria: string;
  ubicacion: string;
  cantidad: number;
  stock_minimo: number;
  precio_unitario: number;
  unidad_medida: string;
  comentario: string;
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

export const CreateMaterialModal = ({ open, onOpenChange, onSuccess }: CreateMaterialModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MaterialFormData>({
    nombre: '',
    codigo: '',
    categoria: '',
    ubicacion: '',
    cantidad: 0,
    stock_minimo: 0,
    precio_unitario: 0,
    unidad_medida: 'unidad',
    comentario: ''
  });

  const handleChange = (field: keyof MaterialFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'cantidad' || field === 'stock_minimo' || field === 'precio_unitario'
      ? parseFloat(e.target.value) || 0
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof MaterialFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = () => {
    const code = n8nService.generateMaterialCode();
    setFormData(prev => ({ ...prev, codigo: code }));
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
    if (!formData.nombre.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre del material es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (!formData.codigo.trim()) {
      toast({
        title: "Error de validación",
        description: "El código del material es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (formData.cantidad < 0 || formData.stock_minimo < 0) {
      toast({
        title: "Error de validación",
        description: "Las cantidades no pueden ser negativas",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await n8nService.createMaterial({
        codigo: formData.codigo,
        name: formData.nombre,
        category: formData.categoria || 'Sin categoría',
        location: formData.ubicacion || 'Sin ubicación',
        current_stock: formData.cantidad,
        min_stock: formData.stock_minimo,
        precio_unitario: formData.precio_unitario,
        unidad_medida: formData.unidad_medida,
        comment: formData.comentario || 'Material creado desde la aplicación',
        usuario_id: user.id,
        usuario_email: user.email || ''
      });

      if (response.status === 'success') {
        toast({
          title: "¡Material creado exitosamente!",
          description: `${formData.nombre} ha sido agregado al inventario`,
        });

        // Resetear formulario
        setFormData({
          nombre: '',
          codigo: '',
          categoria: '',
          ubicacion: '',
          cantidad: 0,
          stock_minimo: 0,
          precio_unitario: 0,
          unidad_medida: 'unidad',
          comentario: ''
        });

        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Error creando material:', error);
      toast({
        title: "Error al crear material",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Crear Nuevo Material</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Material *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange('nombre')}
                  placeholder="Ej: Filtro de aire industrial"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código del Material *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={handleChange('codigo')}
                    placeholder="Ej: MAT_123456"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCode}
                  >
                    Generar
                  </Button>
                </div>
              </div>

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

          {/* Información de Stock */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Información de Stock</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad Inicial *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.cantidad}
                  onChange={handleChange('cantidad')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock_minimo}
                  onChange={handleChange('stock_minimo')}
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

          {/* Información Adicional */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="comentario">Comentario</Label>
                <Textarea
                  id="comentario"
                  value={formData.comentario}
                  onChange={handleChange('comentario')}
                  placeholder="Información adicional sobre el material..."
                  rows={3}
                />
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
                  Creando...
                </>
              ) : (
                'Crear Material'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};