// ========== SECAO: SERVICO DE ARMAZENAMENTO LOCAL ==========

import type { Video, ChannelInfo } from '../types';
import { STORAGE_KEYS, API_CONFIG } from '../constants';

/**
 * Interface para dados em cache
 */
interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * Verifica se o cache ainda e valido
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < API_CONFIG.CACHE_DURATION_MS;
}

/**
 * Salva dados no localStorage com timestamp
 */
function setCache<T>(key: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Erro ao salvar cache:', error);
  }
}

/**
 * Recupera dados do localStorage se ainda validos
 */
function getCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData: CacheData<T> = JSON.parse(cached);

    if (!isCacheValid(cacheData.timestamp)) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Erro ao ler cache:', error);
    return null;
  }
}

// ========== VIDEOS ==========

/**
 * Salva lista de videos no cache
 */
export function cacheVideos(videos: Video[]): void {
  // Converte datas para string para armazenamento
  const videosToCache = videos.map(v => ({
    ...v,
    publishedAt: v.publishedAt.toISOString(),
  }));
  setCache(STORAGE_KEYS.VIDEOS_CACHE, videosToCache);
}

/**
 * Recupera lista de videos do cache
 */
export function getCachedVideos(): Video[] | null {
  const cached = getCache<Array<Video & { publishedAt: string }>>(STORAGE_KEYS.VIDEOS_CACHE);
  if (!cached) return null;

  // Converte strings de volta para Date
  return cached.map(v => ({
    ...v,
    publishedAt: new Date(v.publishedAt),
  }));
}

// ========== CANAL ==========

/**
 * Salva informacoes do canal no cache
 */
export function cacheChannelInfo(channelInfo: ChannelInfo): void {
  setCache(STORAGE_KEYS.CHANNEL_CACHE, channelInfo);
}

/**
 * Recupera informacoes do canal do cache
 */
export function getCachedChannelInfo(): ChannelInfo | null {
  return getCache<ChannelInfo>(STORAGE_KEYS.CHANNEL_CACHE);
}

// ========== UTILIDADES ==========

/**
 * Limpa todo o cache da aplicacao
 */
export function clearAllCache(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Verifica se existe cache valido
 */
export function hasCachedData(): boolean {
  return getCachedVideos() !== null;
}

/**
 * Retorna tempo restante do cache em minutos
 */
export function getCacheRemainingTime(): number {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.VIDEOS_CACHE);
    if (!cached) return 0;

    const cacheData: CacheData<unknown> = JSON.parse(cached);
    const remaining = API_CONFIG.CACHE_DURATION_MS - (Date.now() - cacheData.timestamp);

    return Math.max(0, Math.ceil(remaining / 60000));
  } catch {
    return 0;
  }
}
