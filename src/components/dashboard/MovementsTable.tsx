import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Activity, TrendingUp, TrendingDown, Package, Eye } from 'lucide-react';
import type { Movement } from '@/services/inventory';

interface MovementsTableProps {
  movements: Movement[];
  limit?: number;
}

export const MovementsTable = ({ movements, limit }: MovementsTableProps) => {
  const displayMovements = limit ? movements.slice(0, limit) : movements;
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);


  const getMovementTypeLabel = (type: Movement['type']) => {
    switch (type) {
      case 'increase':
        return 'Entrada';
      case 'decrease':
        return 'Salida';
      case 'create':
        return 'Creación';
      default:
        return 'Movimiento';
    }
  };

  const getMovementVariant = (type: Movement['type']) => {
    switch (type) {
      case 'increase':
        return 'outline' as const;
      case 'decrease':
        return 'destructive' as const;
      case 'create':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatQuantity = (quantity: number) => {
    return quantity > 0 ? `+${quantity}` : quantity.toString();
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year}T${hours}:${minutes}:${seconds}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Movimientos Recientes</span>
          {limit && (
            <Badge variant="secondary" className="ml-2">
              {displayMovements.length} de {movements.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Badge
                        variant={getMovementVariant(movement.type)}
                        className="text-xs"
                      >
                        {getMovementTypeLabel(movement.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-48 truncate">
                      {movement.materialName}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      movement.quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatQuantity(movement.quantity)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {movement.responsible}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                      {movement.comment || 'Sin comentario'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(movement.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMovement(movement)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Modal de detalles del movimiento */}
      <Dialog open={!!selectedMovement} onOpenChange={() => setSelectedMovement(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Detalles del Movimiento</span>
            </DialogTitle>
          </DialogHeader>

          {selectedMovement && (
            <div className="space-y-4">
              {/* Sección 1: Información del movimiento (AZUL) */}
              <div className="p-4 bg-blue-50 rounded-lg w-full">
                <h4 className="font-medium text-blue-900 mb-3">Información del movimiento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">ID del movimiento:</span>
                    <span className="text-sm font-mono font-medium text-blue-900">{selectedMovement.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Tipo:</span>
                    <Badge variant={getMovementVariant(selectedMovement.type)}>
                      {getMovementTypeLabel(selectedMovement.type)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Responsable:</span>
                    <span className="text-sm font-medium text-blue-900">{selectedMovement.responsible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Fecha y Hora:</span>
                    <span className="text-sm font-medium text-blue-900">{formatDate(selectedMovement.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Detalle de Cantidad (VERDE) */}
              <div className="p-4 bg-green-50 rounded-lg w-full">
                <h4 className="font-medium text-green-900 mb-3">Detalle de Cantidad</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Cantidad:</span>
                    <span className={`text-sm font-bold ${
                      selectedMovement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatQuantity(selectedMovement.quantity)}
                    </span>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.abs(selectedMovement.quantity)}
                    </div>
                    <div className="text-xs text-green-700">
                      {selectedMovement.type === 'increase' ? 'Unidades Agregadas' :
                       selectedMovement.type === 'decrease' ? 'Unidades Retiradas' : 'Unidades'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Información del material (GRIS) */}
              <div className="p-4 bg-gray-50 rounded-lg w-full">
                <h4 className="font-medium text-gray-900 mb-3">Información del material</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID del material:</span>
                    <span className="text-sm font-mono font-medium text-gray-900">{selectedMovement.materialId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nombre del material:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMovement.materialName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};