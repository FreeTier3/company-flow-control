
import { useState, useEffect, useCallback } from 'react';

interface CacheConfig<T> {
  key: string;
  ttl?: number; // Time to live em minutos, padrão 30 minutos
  postProcess?: (data: any) => T; // Function to post-process cached data
}

export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  config: CacheConfig<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { key, ttl = 30, postProcess } = config;

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const expirationTime = timestamp + (ttl * 60 * 1000); // TTL em milissegundos
        
        if (now < expirationTime) {
          console.log(`Cache hit for ${key}`);
          // Apply post-processing if provided (e.g., convert strings back to Date objects)
          return postProcess ? postProcess(cachedData) : cachedData;
        } else {
          console.log(`Cache expired for ${key}`);
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error reading cache for ${key}:`, error);
      localStorage.removeItem(key);
    }
    return null;
  }, [key, ttl, postProcess]);

  const setCachedData = useCallback((newData: T) => {
    try {
      const cacheEntry = {
        data: newData,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
      console.log(`Data cached for ${key}`);
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
    }
  }, [key]);

  const fetchData = useCallback(async (useCache = true) => {
    try {
      setError(null);
      
      // Primeiro tenta carregar do cache se solicitado
      if (useCache) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          // Continua com fetch em background para atualizar
        }
      }

      // Faz fetch dos dados
      const newData = await fetchFn();
      setData(newData);
      setCachedData(newData);
    } catch (err) {
      console.error(`Error fetching data for ${key}:`, err);
      setError(err as Error);
      
      // Se falhou e não temos dados em cache, tenta carregar do cache mesmo expirado
      if (!data) {
        const fallbackData = getCachedData();
        if (fallbackData) {
          setData(fallbackData);
          console.log(`Using expired cache as fallback for ${key}`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, getCachedData, setCachedData, key, data]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(key);
    console.log(`Cache invalidated for ${key}`);
  }, [key]);

  const refreshData = useCallback(() => {
    setLoading(true);
    return fetchData(false); // Force fetch without using cache
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refreshData,
    invalidateCache
  };
}
