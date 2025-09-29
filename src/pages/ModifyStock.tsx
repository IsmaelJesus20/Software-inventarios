import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Plus, Minus, Package, Loader2, Search, ArrowLeft, Home, LogOut } from 'lucide-react';
import { n8nService } from '@/services/n8n';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import type { Material } from '@/services/inventory';

interface StockFormData {
  material_id: string;
  material_name: string;
  current_stock: number;
  tipo_operacion: 'increase' | 'decrease';
  cantidad: number;
  comentario: string;
}

const ModifyStock = () => {
  const navigate = useNavigate();
  const { materialId } = useParams<{ materialId: string }>();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { materials, searchMaterials, refreshData } = useInventory();

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

  // Verificar autenticación
  useEffect(() => {
    console.log('🔒 ModifyStock useEffect: authLoading =', authLoading, ', isAuthenticated =', isAuthenticated);

    // Solo redirigir si terminó de cargar Y no está autenticado
    if (!authLoading && !isAuthenticated) {
      console.log('❌ ModifyStock: Usuario no autenticado (carga terminada), redirigiendo a /login');
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      console.log('✅ ModifyStock: Usuario autenticado, permaneciendo en página');
    } else if (authLoading) {
      console.log('⏳ ModifyStock: Esperando verificación de autenticación...');
    }
  }, [authLoading, isAuthenticated, navigate]);

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

    performSearch();
  }, [searchQuery, materials, searchMaterials]);

  // Inicializar con primeros resultados
  useEffect(() => {
    setSearchResults(materials.slice(0, 10));
  }, [materials]);

  // Manejar preselección automática desde URL (para QR)
  useEffect(() => {
    if (materialId && materials.length > 0) {
      console.log('🔗 ModifyStock: materialId detectado en URL:', materialId);

      // Buscar material por ID
      const preselectedMaterial = materials.find(m => m.id === materialId);

      if (preselectedMaterial) {
        console.log('✅ Material encontrado por ID:', preselectedMaterial.name);

        // Preseleccionar el material automáticamente
        setSelectedMaterial(preselectedMaterial);
        setFormData(prev => ({
          ...prev,
          material_id: preselectedMaterial.id,
          material_name: preselectedMaterial.name,
          current_stock: preselectedMaterial.currentStock
        }));

        // Poner el nombre del material en la barra de búsqueda
        setSearchQuery(preselectedMaterial.name);

        // Limpiar resultados de búsqueda para mostrar solo el seleccionado
        setSearchResults([]);

        console.log('🎯 Material preseleccionado automáticamente');
      } else {
        console.log('❌ Material no encontrado con ID:', materialId);
        // Si no se encuentra el material, buscar por código
        const materialByCode = materials.find(m =>
          m.codigo.toLowerCase() === materialId.toLowerCase()
        );

        if (materialByCode) {
          console.log('✅ Material encontrado por código:', materialByCode.name);
          setSelectedMaterial(materialByCode);
          setFormData(prev => ({
            ...prev,
            material_id: materialByCode.id,
            material_name: materialByCode.name,
            current_stock: materialByCode.currentStock
          }));
          setSearchQuery(materialByCode.name);
          setSearchResults([]);
        }
      }
    }
  }, [materialId, materials]);

  const handleLogout = async () => {
    await logout();
  };

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

        refreshData();
        navigate('/');
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo...</p>
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
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {materialId ? 'Gestión Rápida desde QR' : 'Modificar Stock'}
              </h1>
              <p className="text-sm text-gray-600">
                {materialId ? 'Material preseleccionado automáticamente' : 'Gestión de inventario'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.originalRole}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

          {/* Búsqueda y Selección de Material */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Seleccionar Material</span>
              </CardTitle>
              <CardDescription>
                Busca y selecciona el material al que quieres modificar el stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="max-h-64 overflow-y-auto border rounded-lg bg-white">
                {searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((material) => (
                      <div
                        key={material.id}
                        className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedMaterial?.id === material.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleMaterialSelect(material)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-gray-500">
                              {material.codigo} • {material.category} • {material.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Stock: {material.currentStock}</p>
                            <p className="text-sm text-gray-500">Mín: {material.minStock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron materiales</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Material Seleccionado y Operación */}
          {selectedMaterial && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Material Seleccionado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Info del material */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedMaterial.name}</h4>
                      <p className="text-gray-600">{selectedMaterial.codigo}</p>
                      <p className="text-sm text-gray-500">{selectedMaterial.category} • {selectedMaterial.location}</p>
                    </div>
                    <div className="text-right md:text-right">
                      <p className="text-3xl font-bold text-primary">{selectedMaterial.currentStock}</p>
                      <p className="text-sm text-gray-500">Stock Actual</p>
                      <p className="text-sm text-gray-500">Mínimo: {selectedMaterial.minStock}</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de operación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="text-center text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stock Resultante</Label>
                    <div className="p-3 bg-white border rounded-md text-center">
                      <span className={`font-bold text-2xl ${
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

                {/* Comentario */}
                <div className="space-y-2">
                  <Label htmlFor="comentario">Comentario / Motivo *</Label>
                  <Textarea
                    id="comentario"
                    value={formData.comentario}
                    onChange={handleChange('comentario')}
                    placeholder="Describe el motivo de la modificación del stock..."
                    rows={4}
                    required
                    className="resize-none"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={loading}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !selectedMaterial}
                    className="flex-1"
                  >
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
                </div>
              </CardContent>
            </Card>
          )}

        </form>
      </div>
    </div>
  );
};

export default ModifyStock;