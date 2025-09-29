import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { Material } from '@/services/inventory';

interface QRCodeGeneratorProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeGenerator = ({ material, isOpen, onClose }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // URL que apuntará al material específico
  // Usar EXACTAMENTE la misma URL base que estás usando en el navegador
  const getBaseUrl = () => {
    // Si hay una URL configurada en .env, usarla (solo para producción)
    if (import.meta.env.VITE_APP_BASE_URL && !import.meta.env.DEV) {
      return import.meta.env.VITE_APP_BASE_URL;
    }

    // En desarrollo, SIEMPRE usar window.location.origin
    // Esto significa que si estás en http://192.168.1.150:5173/,
    // el QR usará exactamente esa URL
    return window.location.origin;
  };

  const baseUrl = getBaseUrl();
  const materialUrl = `${baseUrl}/modify-stock/${material.id}`;

  // Log para debugging - puedes ver esto en la consola del navegador
  console.log('🔗 QR Code URL generada:', materialUrl);
  console.log('📍 Base URL actual:', baseUrl);
  console.log('🌐 Window location:', window.location.origin);

  // Detectar si estamos usando la URL de desarrollo
  const isDevMode = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('192.168.');
  const isUsingFallback = !import.meta.env.VITE_APP_BASE_URL;
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  useEffect(() => {
    if (isOpen && material) {
      generateQRCode();
    }
  }, [isOpen, material]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const qrCodeDataUrl = await QRCode.toDataURL(materialUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generando QR:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(materialUrl);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "URL copiada al portapapeles"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive"
      });
    }
  };

  const downloadImage = async () => {
    if (!qrCodeUrl) return;

    try {
      setLoading(true);

      // Crear un enlace temporal para descargar la imagen
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `QR_${material.codigo}_${material.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

      // Simular click para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "¡Descargado!",
        description: `QR guardado como imagen PNG`
      });
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar la imagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Código QR - {material.name}</span>
          </DialogTitle>
          <DialogDescription>
            Escanea este código para acceder directamente a la modificación de stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contenedor del QR para captura */}
          <div ref={qrContainerRef} className="bg-white p-6 rounded-lg border">
            {/* QR Code */}
            <div className="text-center space-y-4">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code para ${material.name}`}
                  className="mx-auto w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400 animate-pulse" />
                </div>
              )}

              {/* Información del Material */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                <p className="text-sm text-gray-600">Código: {material.codigo}</p>
                <p className="text-xs text-gray-500">{material.category} • {material.location}</p>

                {/* URL con indicador de tipo */}
                <div className="flex items-center justify-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isLocalhost
                      ? 'bg-red-100 text-red-700'
                      : baseUrl.includes('192.168.') || baseUrl.includes('10.') || baseUrl.includes('172.')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {isLocalhost
                      ? '🔴 Localhost'
                      : baseUrl.includes('192.168.') || baseUrl.includes('10.') || baseUrl.includes('172.')
                        ? '🟡 Red Local'
                        : '🟢 Producción'
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono break-all">{materialUrl}</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={copyUrl}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </>
              )}
            </Button>

            <Button
              onClick={downloadImage}
              className="w-full"
              disabled={loading || !qrCodeUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Descargando...' : 'Descargar PNG'}
            </Button>
          </div>

          {/* Advertencia de desarrollo */}
          {(isDevMode || isUsingFallback) && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">⚠️ Configuración de Red</h4>
              {isLocalhost ? (
                <div className="space-y-2">
                  <p className="text-sm text-amber-800">
                    Esta URL usa <code className="bg-amber-100 px-1 rounded">localhost</code> y no funcionará en otros dispositivos.
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>Para que funcione en móviles:</strong>
                  </p>
                  <ol className="text-xs text-amber-700 ml-4 space-y-1">
                    <li>1. Para el servidor actual</li>
                    <li>2. Ejecuta: <code className="bg-amber-100 px-1 rounded">npm run dev -- --host</code></li>
                    <li>3. Vite te dará una URL con tu IP local (ej: http://192.168.1.100:5173)</li>
                    <li>4. Abre esa URL en tu navegador y genera el QR nuevamente</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-amber-800">
                    {isUsingFallback
                      ? "No se ha configurado VITE_APP_BASE_URL. Usando URL actual."
                      : "Modo de desarrollo detectado."
                    }
                  </p>
                  <p className="text-xs text-amber-700">
                    Para producción: configura VITE_APP_BASE_URL con tu dominio real.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo usar este QR?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Escanea el QR con cualquier app de cámara</li>
              <li>• Te llevará directamente a modificar stock de este material</li>
              <li>• El material aparecerá ya preseleccionado</li>
              <li>• Solo tendrás que elegir cantidad y operación</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;