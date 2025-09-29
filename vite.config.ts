import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Explícitamente permitir todas las IPs
    hmr: {
      overlay: false,
      port: 5173
    },
    // Evitar problemas de cache en Windows
    watch: {
      usePolling: true,
      interval: 1000
    },
    // Configuración para red local
    strictPort: false, // Permite cambiar de puerto si 5173 está ocupado
  },
  // Optimizar dependencias para evitar re-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react', 'jspdf', 'html2canvas', 'qrcode']
  },
  // Configuración para manejar dependencias problemáticas
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
});