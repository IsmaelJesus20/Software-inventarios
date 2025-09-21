import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, Calendar, Hash, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Material } from '@/services/inventory';

interface MaterialDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
}

export const MaterialDetailsModal = ({ open, onOpenChange, material }: MaterialDetailsModalProps) => {
  if (!material) return null;

  const getStockStatus = () => {
    if (material.currentStock === 0) {
      return {
        status: 'critical',
        label: 'Sin Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle
      };
    } else if (material.currentStock <= material.minStock) {
      return {
        status: 'low',
        label: 'Stock Bajo',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: Clock
      };
    } else {
      return {
        status: 'normal',
        label: 'Stock Normal',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle
      };
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <span className="text-xl font-bold">{material.name}</span>
              <p className="text-sm text-muted-foreground font-normal">
                Código: {material.codigo}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado del Stock */}
          <Card className={`border-2 ${stockStatus.bgColor}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${stockStatus.color}`} />
                <span>Estado del Inventario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className={`text-3xl font-bold ${stockStatus.color} mb-1`}>
                    {material.currentStock}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock Actual</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    {material.minStock}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock Mínimo</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {material.initialStock}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock Inicial</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Badge
                  variant={stockStatus.status === 'normal' ? 'default' : 'outline'}
                  className={`px-4 py-2 text-sm font-medium ${
                    stockStatus.status === 'critical' ? 'text-red-700 border-red-600' :
                    stockStatus.status === 'low' ? 'text-yellow-700 border-yellow-600' :
                    'text-green-700 bg-green-100 border-green-600'
                  }`}
                >
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {stockStatus.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Categoría</div>
                      <div className="font-semibold">{material.category}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Ubicación</div>
                      <div className="font-semibold">{material.location}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Código Interno</div>
                      <div className="font-semibold font-mono text-blue-600">{material.codigo}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Diferencia vs Mínimo</div>
                      <div className={`font-semibold ${
                        material.currentStock - material.minStock >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {material.currentStock - material.minStock >= 0 ? '+' : ''}{material.currentStock - material.minStock} unidades
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Historial</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Fecha de Creación</div>
                    <div className="font-semibold">{formatDate(material.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Última Actualización</div>
                    <div className="font-semibold">{formatDate(material.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};