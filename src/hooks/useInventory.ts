import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryService, type Material, type Movement } from '@/services/inventory';

// Improved cache management with Map for component-specific cleanup
const CACHE_DURATION = 30000; // 30 seconds
const inventoryCache = new Map<string, {
  materials: Material[];
  movements: Movement[];
  stats: any;
  lastFetch: number;
}>();

// Cache key for global inventory data
const CACHE_KEY = 'global_inventory';

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

  // Refs to prevent race conditions and memory leaks
  const isMountedRef = useRef(true);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    // Prevent multiple simultaneous loads
    if (loadingPromiseRef.current && !forceRefresh) {
      return loadingPromiseRef.current;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      if (!isMountedRef.current) return;

      setError(null);

      // Check cache
      const now = Date.now();
      const cachedData = inventoryCache.get(CACHE_KEY);

      if (!forceRefresh && cachedData && (now - cachedData.lastFetch) < CACHE_DURATION) {
        console.log('📋 useInventory: Usando datos del cache');

        if (isMountedRef.current) {
          setMaterials(cachedData.materials);
          setMovements(cachedData.movements);
          setStats(cachedData.stats);
          setLoading(false);
        }
        return;
      }

      console.log('🔄 useInventory: Cargando datos frescos...');

      if (isMountedRef.current) {
        setLoading(true);
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const loadPromise = Promise.all([
        inventoryService.getMaterials(),
        inventoryService.getMovements(),
        inventoryService.getStats()
      ]).then(([materialsData, movementsData, statsData]) => {
        if (!isMountedRef.current) return;

        // Update cache
        inventoryCache.set(CACHE_KEY, {
          materials: materialsData,
          movements: movementsData,
          stats: statsData,
          lastFetch: now
        });

        console.log('✅ useInventory: Datos actualizados:', {
          materials: materialsData.length,
          movements: movementsData.length,
          stats: statsData
        });

        setMaterials(materialsData);
        setMovements(movementsData);
        setStats(statsData);
      });

      loadingPromiseRef.current = loadPromise;
      await loadPromise;

    } catch (err) {
      if (!isMountedRef.current) return;

      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      console.error('❌ useInventory: Error:', errorMessage);
      setError(errorMessage);
    } finally {
      loadingPromiseRef.current = null;
      abortControllerRef.current = null;

      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial data load
    loadData();

    return () => {
      isMountedRef.current = false;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear loading promise reference
      loadingPromiseRef.current = null;
    };
  }, []); // Empty dependency array is correct - we only want to load data once on mount

  const createMaterial = useCallback(async (materialData: {
    name: string;
    category: string;
    location: string;
    current_stock: number;
    min_stock: number;
    initial_stock: number;
  }) => {
    if (!isMountedRef.current) return;

    try {
      const newMaterial = await inventoryService.createMaterial(materialData);

      // Clear cache to force fresh data
      inventoryCache.delete(CACHE_KEY);

      // Reload data
      await loadData(true);
      return newMaterial;
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Error al crear material';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadData]);

  const updateStock = useCallback(async (materialId: string, change: number, comment: string) => {
    if (!isMountedRef.current) return;

    try {
      await inventoryService.updateStock(materialId, change, comment);

      // Clear cache to force fresh data
      inventoryCache.delete(CACHE_KEY);

      // Reload data
      await loadData(true);
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar stock';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadData]);

  const searchMaterials = useCallback(async (query: string): Promise<Material[]> => {
    if (!isMountedRef.current) return [];

    try {
      return await inventoryService.searchMaterials(query);
    } catch (err) {
      if (!isMountedRef.current) return [];

      const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda';
      setError(errorMessage);
      return [];
    }
  }, []);

  const getStats = useCallback(() => {
    return stats;
  }, [stats]);

  const refreshData = useCallback(() => {
    // Clear cache to force fresh data
    inventoryCache.delete(CACHE_KEY);

    // Force refresh
    loadData(true);
  }, [loadData]);

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