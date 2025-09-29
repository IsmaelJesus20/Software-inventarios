import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, Check, X, RefreshCw } from 'lucide-react';

const NetworkTest = () => {
  const [networkInfo, setNetworkInfo] = useState({
    currentUrl: '',
    hostname: '',
    port: '',
    protocol: '',
    userAgent: '',
    timestamp: ''
  });

  const [connectionTest, setConnectionTest] = useState({
    status: 'testing',
    message: '',
    details: []
  });

  useEffect(() => {
    // Obtener información de red
    const info = {
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      timestamp: new Date().toLocaleString()
    };
    setNetworkInfo(info);

    // Test de conectividad básica
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionTest({
      status: 'testing',
      message: 'Probando conectividad...',
      details: []
    });

    const tests = [];

    try {
      // Test 1: Verificar que la página carga
      tests.push({
        name: 'Carga de página',
        status: 'success',
        message: 'La página se cargó correctamente'
      });

      // Test 2: Verificar tipo de conexión
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isLocalNetwork = window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');

      if (isLocalhost) {
        tests.push({
          name: 'Tipo de conexión',
          status: 'warning',
          message: 'Usando localhost - no accesible desde otros dispositivos'
        });
      } else if (isLocalNetwork) {
        tests.push({
          name: 'Tipo de conexión',
          status: 'success',
          message: 'Usando IP de red local - accesible desde otros dispositivos'
        });
      } else {
        tests.push({
          name: 'Tipo de conexión',
          status: 'success',
          message: 'Usando dominio público'
        });
      }

      // Test 3: Verificar navegador
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      tests.push({
        name: 'Dispositivo',
        status: 'info',
        message: isMobile ? 'Dispositivo móvil detectado' : 'Dispositivo de escritorio detectado'
      });

      setConnectionTest({
        status: 'completed',
        message: 'Diagnóstico completado',
        details: tests
      });

    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: 'Error durante el diagnóstico',
        details: [{
          name: 'Error',
          status: 'error',
          message: error.message
        }]
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Wifi className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Diagnóstico de Red</h1>
          <p className="text-gray-600">Información de conectividad para QR codes</p>
        </div>

        {/* Información de Red */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>Información de Conexión</span>
            </CardTitle>
            <CardDescription>
              Detalles técnicos de tu conexión actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">URL Actual</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                  {networkInfo.currentUrl}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hostname</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {networkInfo.hostname}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Puerto</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {networkInfo.port || 'Puerto estándar'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Protocolo</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {networkInfo.protocol}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User Agent</label>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                {networkInfo.userAgent}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timestamp</label>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {networkInfo.timestamp}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test de Conectividad */}
        <Card>
          <CardHeader>
            <CardTitle>Test de Conectividad</CardTitle>
            <CardDescription>
              Resultados del diagnóstico automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado:</span>
              <Badge variant="outline" className={getStatusColor(connectionTest.status)}>
                {connectionTest.message}
              </Badge>
            </div>

            {connectionTest.details.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detalles:</h4>
                {connectionTest.details.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{test.message}</span>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={testConnection} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Ejecutar Diagnóstico Nuevamente
            </Button>
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Instrucciones para Móvil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Para probar conectividad desde móvil:</h4>
              <ol className="text-sm text-blue-800 space-y-1 ml-4">
                <li>1. Conecta tu móvil a la misma WiFi que este PC</li>
                <li>2. En tu móvil, abre el navegador</li>
                <li>3. Escribe exactamente esta URL:</li>
                <li className="font-mono bg-blue-100 p-2 rounded mt-2 break-all">
                  {networkInfo.currentUrl}
                </li>
                <li>4. Si carga esta página, la conectividad funciona</li>
                <li>5. Si no carga, hay un problema de red/firewall</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkTest;