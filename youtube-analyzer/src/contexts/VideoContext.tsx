// ========== SECAO: CONTEXT DE VIDEOS ==========

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Video, ChannelInfo, DataSource, SyncResult } from '../types';
import {
  fetchChannelVideos,
  isApiKeyConfigured,
} from '../services/youtube.service';
import {
  getCachedVideos,
  getCachedChannelInfo,
  cacheVideos,
  cacheChannelInfo,
} from '../services/storage.service';
import {
  fetchVideosFromDatabase,
  syncWithYouTube,
  checkDatabaseHealth,
} from '../services/neon.service';

// ========== TIPOS ==========

interface VideoContextType {
  videos: Video[];
  channelInfo: ChannelInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
  refreshVideos: () => Promise<void>;
  // Novos campos para banco de dados
  dataSource: DataSource;
  isDatabaseAvailable: boolean;
  lastDatabaseSync: Date | null;
  isSyncing: boolean;
  syncToDatabase: () => Promise<SyncResult>;
}

// ========== CONTEXT ==========

const VideoContext = createContext<VideoContextType | null>(null);

// ========== PROVIDER ==========

interface VideoProviderProps {
  children: ReactNode;
}

export function VideoProvider({ children }: VideoProviderProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para banco de dados
  const [dataSource, setDataSource] = useState<DataSource>('cache');
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState(false);
  const [lastDatabaseSync, setLastDatabaseSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Verifica se banco de dados esta disponivel
   */
  const checkDatabase = useCallback(async () => {
    const available = await checkDatabaseHealth();
    setIsDatabaseAvailable(available);
    return available;
  }, []);

  /**
   * Busca videos (tenta DB primeiro, depois cache, depois API)
   */
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Tenta banco de dados primeiro
      const dbAvailable = await checkDatabase();

      if (dbAvailable) {
        try {
          const dbResult = await fetchVideosFromDatabase();

          if (dbResult.videos.length > 0) {
            setVideos(dbResult.videos);
            setChannelInfo(dbResult.channel);
            setLastDatabaseSync(dbResult.lastSync);
            setDataSource('database');
            setIsLoading(false);
            return;
          }
        } catch (dbError) {
          console.warn('Erro ao buscar do banco, tentando fallback:', dbError);
        }
      }

      // 2. Tenta cache do localStorage
      const cachedVideos = getCachedVideos();
      const cachedChannel = getCachedChannelInfo();

      if (cachedVideos && cachedChannel) {
        setVideos(cachedVideos);
        setChannelInfo(cachedChannel);
        setDataSource('cache');
        setIsLoading(false);
        return;
      }

      // 3. Fallback: busca da YouTube API
      if (!isApiKeyConfigured()) {
        setError('API Key do YouTube nao configurada. Configure VITE_YOUTUBE_API_KEY no arquivo .env');
        setIsLoading(false);
        return;
      }

      const { channel, videos: fetchedVideos } = await fetchChannelVideos();

      setVideos(fetchedVideos);
      setChannelInfo(channel);
      setDataSource('api');

      // Salva no cache
      cacheVideos(fetchedVideos);
      cacheChannelInfo(channel);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar videos';
      setError(message);
      console.error('Erro ao buscar videos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkDatabase]);

  /**
   * Forca refresh da YouTube API (ignora cache e DB)
   */
  const refreshVideos = useCallback(async () => {
    if (!isApiKeyConfigured()) {
      setError('API Key do YouTube nao configurada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { channel, videos: fetchedVideos } = await fetchChannelVideos();

      setVideos(fetchedVideos);
      setChannelInfo(channel);
      setDataSource('api');

      // Atualiza cache
      cacheVideos(fetchedVideos);
      cacheChannelInfo(channel);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar videos';
      setError(message);
      console.error('Erro ao atualizar videos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sincroniza com banco de dados Neon
   */
  const syncToDatabase = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncWithYouTube();

      if (result.success) {
        // Recarrega videos do banco apos sync
        const dbResult = await fetchVideosFromDatabase();
        setVideos(dbResult.videos);
        setChannelInfo(dbResult.channel);
        setLastDatabaseSync(result.syncedAt);
        setDataSource('database');
        setIsDatabaseAvailable(true);
      } else {
        setError(result.error || 'Erro ao sincronizar');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setError(message);
      console.error('Erro ao sincronizar:', err);

      return {
        success: false,
        videosSynced: 0,
        metricsRecorded: 0,
        syncedAt: new Date(),
        error: message,
      };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Carrega videos do cache INSTANTANEAMENTE ao montar
  // Usuario clica "Atualizar" para buscar dados novos
  useEffect(() => {
    // Tenta carregar do cache primeiro (instantaneo)
    const cachedVideos = getCachedVideos();
    const cachedChannel = getCachedChannelInfo();

    if (cachedVideos && cachedVideos.length > 0 && cachedChannel) {
      setVideos(cachedVideos);
      setChannelInfo(cachedChannel);
      setDataSource('cache');
      // Verifica DB em background (sem bloquear UI)
      checkDatabase();
    } else {
      // Se nao tem cache, busca dados
      fetchVideos();
    }
  }, []);

  const value: VideoContextType = {
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
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

// ========== HOOK ==========

export function useVideoContext(): VideoContextType {
  const context = useContext(VideoContext);

  if (!context) {
    throw new Error('useVideoContext deve ser usado dentro de VideoProvider');
  }

  return context;
}
