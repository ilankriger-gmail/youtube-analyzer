// ========== SECAO: HOOK USE VIDEOS ==========

import { useMemo } from 'react';
import { useVideoContext } from '../contexts';
import { calculateVideoStats } from '../utils/video.utils';

/**
 * Hook para acessar videos e estatisticas
 */
export function useVideos() {
  const {
    videos,
    channelInfo,
    isLoading,
    error,
    fetchVideos,
    refreshVideos,
    // Campos de banco de dados
    dataSource,
    isDatabaseAvailable,
    lastDatabaseSync,
    isSyncing,
    syncToDatabase,
  } = useVideoContext();

  // Calcula estatisticas
  const stats = useMemo(() => {
    return calculateVideoStats(videos);
  }, [videos]);

  return {
    videos,
    channelInfo,
    isLoading,
    error,
    stats,
    fetchVideos,
    refreshVideos,
    // Campos de banco de dados
    dataSource,
    isDatabaseAvailable,
    lastDatabaseSync,
    isSyncing,
    syncToDatabase,
  };
}
