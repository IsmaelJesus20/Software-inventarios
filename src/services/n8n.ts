// Servicio para operaciones de escritura a través de n8n
// n8n se encarga de modificar Supabase, la app solo lee de Supabase directamente

export interface N8nMaterialRequest {
  TIPO_ACCION: 'Crear nuevo repuesto' | 'Aumentar stock existente' | 'Reducir stock existente';
  CODIGO?: string;
  DESCRIPCION?: string;
  CATEGORIA?: string;
  UBICACION?: string;
  CANTIDAD: number;
  STOCK_MINIMO?: number;
  PRECIO_UNITARIO?: number;
  UNIDAD_MEDIDA?: string;
  COMENTARIO: string;
  ITEM_ID?: string; // Para operaciones de sumar/restar
  usuario_id: string;
  usuario_email?: string;
}

export interface N8nResponse {
  status: 'success' | 'error';
  message: string;
  operation: 'create' | 'increase' | 'decrease';
  data?: any;
  movement?: any;
  timestamp: string;
}

class N8nService {
  private baseUrl: string;

  constructor() {
    // Usar import.meta.env para Vite en lugar de process.env
    this.baseUrl = import.meta.env.VITE_N8N_BASE_URL || 'https://mvpoh-n8n.ew1xnt.easypanel.host';
  }

  // Crear nuevo material
  async createMaterial(data: {
    codigo: string;
    name: string;
    category: string;
    location: string;
    current_stock: number;
    min_stock: number;
    precio_unitario?: number;
    unidad_medida?: string;
    comment: string;
    usuario_id: string;
    usuario_email?: string;
  }): Promise<N8nResponse> {
    const payload: N8nMaterialRequest = {
      TIPO_ACCION: 'Crear nuevo repuesto',
      CODIGO: data.codigo,
      DESCRIPCION: data.name,
      CATEGORIA: data.category,
      UBICACION: data.location,
      CANTIDAD: data.current_stock,
      STOCK_MINIMO: data.min_stock,
      PRECIO_UNITARIO: data.precio_unitario || 0,
      UNIDAD_MEDIDA: data.unidad_medida || 'unidad',
      COMENTARIO: data.comment,
      usuario_id: data.usuario_id,
      usuario_email: data.usuario_email
    };

    return this.sendToN8n(payload);
  }

  // Aumentar stock
  async increaseStock(data: {
    item_id: string;
    cantidad: number;
    comment: string;
    usuario_id: string;
    usuario_email?: string;
  }): Promise<N8nResponse> {
    const payload: N8nMaterialRequest = {
      TIPO_ACCION: 'Aumentar stock existente',
      ITEM_ID: data.item_id,
      CANTIDAD: data.cantidad,
      COMENTARIO: data.comment,
      usuario_id: data.usuario_id,
      usuario_email: data.usuario_email
    };

    return this.sendToN8n(payload);
  }

  // Reducir stock
  async decreaseStock(data: {
    item_id: string;
    cantidad: number;
    comment: string;
    usuario_id: string;
    usuario_email?: string;
  }): Promise<N8nResponse> {
    const payload: N8nMaterialRequest = {
      TIPO_ACCION: 'Reducir stock existente',
      ITEM_ID: data.item_id,
      CANTIDAD: data.cantidad,
      COMENTARIO: data.comment,
      usuario_id: data.usuario_id,
      usuario_email: data.usuario_email
    };

    return this.sendToN8n(payload);
  }

  // Función privada para enviar datos a n8n
  private async sendToN8n(payload: N8nMaterialRequest): Promise<N8nResponse> {
    try {
      console.log('🔄 Enviando solicitud a n8n:', payload);

      const response = await fetch(`${this.baseUrl}/webhook/sheet-registor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      console.log('✅ Respuesta de n8n:', result);

      // Manejar diferentes formatos de respuesta de n8n
      if (result.message) {
        // Si n8n devuelve solo un mensaje, considerarlo como éxito
        return {
          status: 'success' as const,
          message: result.message,
          operation: payload.TIPO_ACCION === 'Crear nuevo repuesto' ? 'create' as const :
                    payload.TIPO_ACCION === 'Aumentar stock existente' ? 'increase' as const : 'decrease' as const,
          data: result,
          timestamp: new Date().toISOString()
        };
      }

      // Si ya tiene la estructura esperada, devolverlo tal como está
      if (result.status) {
        return result as N8nResponse;
      }

      // Caso por defecto: considerar como éxito si la respuesta HTTP es 200
      return {
        status: 'success' as const,
        message: 'Operación completada exitosamente',
        operation: payload.TIPO_ACCION === 'Crear nuevo repuesto' ? 'create' as const :
                  payload.TIPO_ACCION === 'Aumentar stock existente' ? 'increase' as const : 'decrease' as const,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error enviando a n8n:', error);

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        operation: payload.TIPO_ACCION === 'Crear nuevo repuesto' ? 'create' :
                  payload.TIPO_ACCION === 'Aumentar stock existente' ? 'increase' : 'decrease',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Función auxiliar para generar código de material
  generateMaterialCode(): string {
    return `MAT_${Date.now().toString().slice(-6)}`;
  }
}

export const n8nService = new N8nService();