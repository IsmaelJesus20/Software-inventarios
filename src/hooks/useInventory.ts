import { useState, useEffect } from 'react';
import { inventoryService, type Material, type Movement } from '@/services/inventory';

// Cache global para evitar recargas innecesarias
let globalInventoryData: {
  materials: Material[];
  movements: Movement[];
  stats: any;
  lastFetch: number;
} | null = null;

const CACHE_DURATION = 30000; // 30 segundos

export const useInventory = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStock: 0,
    criticalStock: 0,
    totalMovements: 0,
  });

  const loadData = async (forceRefresh = false) => {
    try {
      setError(null);

      // Verificar cache
      const now = Date.now();
      if (!forceRefresh && globalInventoryData && (now - globalInventoryData.lastFetch) < CACHE_DURATION) {
        console.log('📋 useInventory: Usando datos del cache');
        setMaterials(globalInventoryData.materials);
        setMovements(globalInventoryData.movements);
        setStats(globalInventoryData.stats);
        setLoading(false);
        return;
      }

      console.log('🔄 useInventory: Cargando datos frescos...');
      setLoading(true);

      const [materialsData, movementsData, statsData] = await Promise.all([
        inventoryService.getMaterials(),
        inventoryService.getMovements(),
        inventoryService.getStats()
      ]);

      // Actualizar cache global
      globalInventoryData = {
        materials: materialsData,
        movements: movementsData,
        stats: statsData,
        lastFetch: now
      };

      console.log('✅ useInventory: Datos actualizados:', {
        materials: materialsData.length,
        movements: movementsData.length,
        stats: statsData
      });

      setMaterials(materialsData);
      setMovements(movementsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      console.error('❌ useInventory: Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createMaterial = async (materialData: {
    name: string;
    category: string;
    location: string;
    current_stock: number;
    min_stock: number;
    initial_stock: number;
  }) => {
    try {
      const newMaterial = await inventoryService.createMaterial(materialData);
      await loadData(); // Recargar datos
      return newMaterial;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear material';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStock = async (materialId: string, change: number, comment: string) => {
    try {
      await inventoryService.updateStock(materialId, change, comment);
      await loadData(); // Recargar datos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar stock';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchMaterials = async (query: string): Promise<Material[]> => {
    try {
      return await inventoryService.searchMaterials(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      return [];
    }
  };

  const getStats = () => {
    return stats;
  };

  const refreshData = () => {
    // Invalidar cache y forzar refresh
    globalInventoryData = null;
    loadData(true); // Forzar refresh
  };

  return {
    materials,
    movements,
    loading,
    error,
    stats,
    createMaterial,
    updateStock,
    searchMaterials,
    getStats,
    refreshData,
  };
};