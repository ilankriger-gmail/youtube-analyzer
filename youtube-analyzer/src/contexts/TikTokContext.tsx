// ========== SECAO: CONTEXT TIKTOK ==========

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import {
  fetchTikTokVideosFromDB,
  syncTikTokVideos,
  downloadTikTokWithProgress,
  generateTikTokCSV,
  TIKTOK_FIXED_USERNAME,
  type TikTokVideo,
  type TikTokQuality,
} from '../services/tiktok.service';
import type { UnifiedFilterState } from '../types/filter.types';
import { INITIAL_FILTER_STATE } from '../types/filter.types';
import { applyTikTokFilters, hasActiveFilters as checkActiveFilters } from '../utils/filter.utils';

// ========== TIPOS ==========

interface DownloadQueueItem {
  video: TikTokVideo;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface TikTokContextType {
  // Estado do perfil (fixo: @nextleveldj)
  username: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  videos: TikTokVideo[];
  filteredVideos: TikTokVideo[];
  profile: { username: string; videoCount: number } | null;

  // Sincronizacao com banco
  syncVideos: () => Promise<void>;

  // Filtros unificados
  filters: UnifiedFilterState;
  updateFilters: (partial: Partial<UnifiedFilterState>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
  filteredCount: number;

  // Selecao
  selectedIds: Set<string>;
  toggleSelection: (videoId: string) => void;
  selectTop5: () => void;
  selectBottom5: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  top5Ids: Set<string>;
  bottom5Ids: Set<string>;

  // Download
  quality: TikTokQuality;
  setQuality: (quality: TikTokQuality) => void;
  downloadQueue: DownloadQueueItem[];
  isDownloading: boolean;
  isModalOpen: boolean;
  startBatchDownload: () => Promise<void>;
  cancelDownload: () => void;
  closeModal: () => void;
  completedCount: number;
  failedCount: number;

  // Export CSV
  exportCSV: () => void;
}

// ========== CONTEXT ==========

const TikTokContext = createContext<TikTokContextType | null>(null);

// ========== PROVIDER ==========

interface TikTokProviderProps {
  children: ReactNode;
}

export function TikTokProvider({ children }: TikTokProviderProps) {
  // Estado do perfil (fixo: @nextleveldj)
  const username = TIKTOK_FIXED_USERNAME;
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [profile, setProfile] = useState<{ username: string; videoCount: number } | null>(null);

  // Filtros unificados
  const [filters, setFilters] = useState<UnifiedFilterState>(INITIAL_FILTER_STATE);

  // Selecao
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Download
  const [quality, setQuality] = useState<TikTokQuality>('best');
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueueItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadCancelled, setDownloadCancelled] = useState(false);

  // ========== FILTROS UNIFICADOS ==========

  const updateFilters = useCallback((partial: Partial<UnifiedFilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const hasActiveFilters = useMemo(() => checkActiveFilters(filters), [filters]);

  // Videos filtrados e ordenados via sistema unificado
  const filteredVideos = useMemo(() => {
    return applyTikTokFilters(videos, filters);
  }, [videos, filters]);

  const totalCount = videos.length;
  const filteredCount = filteredVideos.length;

  // ========== TOP 5 / BOTTOM 5 ==========

  const top5Ids = useMemo(() => {
    return new Set(filteredVideos.slice(0, 5).map(v => v.id));
  }, [filteredVideos]);

  const bottom5Ids = useMemo(() => {
    return new Set(filteredVideos.slice(-5).map(v => v.id));
  }, [filteredVideos]);

  // ========== CARREGAR DO BANCO ==========

  useEffect(() => {
    const loadFromDB = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchTikTokVideosFromDB();

        if (!result.success) {
          throw new Error(result.error || 'Falha ao carregar videos');
        }

        setVideos(result.videos);
        setProfile({
          username: result.username,
          videoCount: result.videoCount,
        });
      } catch (err) {
        console.error('[TikTok] Erro ao carregar do banco:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar videos');
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDB();
  }, []);

  // ========== SINCRONIZAR ==========

  const syncVideos = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncTikTokVideos(2000);

      if (!result.success) {
        throw new Error(result.error || 'Falha ao sincronizar');
      }

      setVideos(result.videos);
      setProfile({
        username: result.username,
        videoCount: result.videosCount,
      });
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ========== SELECAO ==========

  const toggleSelection = useCallback((videoId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  const selectTop5 = useCallback(() => {
    setSelectedIds(prev => new Set([...prev, ...top5Ids]));
  }, [top5Ids]);

  const selectBottom5 = useCallback(() => {
    setSelectedIds(prev => new Set([...prev, ...bottom5Ids]));
  }, [bottom5Ids]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredVideos.map(v => v.id)));
  }, [filteredVideos]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ========== DOWNLOAD ==========

  const completedCount = downloadQueue.filter(i => i.status === 'completed').length;
  const failedCount = downloadQueue.filter(i => i.status === 'failed').length;

  const startBatchDownload = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const selectedVideos = filteredVideos.filter(v => selectedIds.has(v.id));

    const queue: DownloadQueueItem[] = selectedVideos.map(video => ({
      video,
      status: 'pending',
      progress: 0,
    }));

    setDownloadQueue(queue);
    setIsDownloading(true);
    setIsModalOpen(true);
    setDownloadCancelled(false);

    for (let i = 0; i < queue.length; i++) {
      if (downloadCancelled) break;

      const item = queue[i];

      setDownloadQueue(prev =>
        prev.map((q, idx) =>
          idx === i ? { ...q, status: 'downloading' } : q
        )
      );

      try {
        await downloadTikTokWithProgress(
          item.video.url,
          quality,
          item.video.title,
          item.video.views,
          (progress) => {
            setDownloadQueue(prev =>
              prev.map((q, idx) =>
                idx === i ? { ...q, progress } : q
              )
            );
          }
        );

        setDownloadQueue(prev =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'completed', progress: 100 } : q
          )
        );
      } catch (err) {
        setDownloadQueue(prev =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'failed', error: err instanceof Error ? err.message : 'Erro' } : q
          )
        );
      }

      if (i < queue.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setIsDownloading(false);
  }, [selectedIds, filteredVideos, quality, downloadCancelled]);

  const cancelDownload = useCallback(() => {
    setDownloadCancelled(true);
    setIsDownloading(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setDownloadQueue([]);
  }, []);

  // ========== EXPORT CSV ==========

  const exportCSV = useCallback(() => {
    if (filteredVideos.length === 0) return;
    generateTikTokCSV(filteredVideos, username);
  }, [filteredVideos, username]);

  // ========== VALUE ==========

  const value: TikTokContextType = {
    username,
    isLoading,
    isSyncing,
    error,
    videos,
    filteredVideos,
    profile,
    syncVideos,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    totalCount,
    filteredCount,
    selectedIds,
    toggleSelection,
    selectTop5,
    selectBottom5,
    selectAll,
    clearSelection,
    top5Ids,
    bottom5Ids,
    quality,
    setQuality,
    downloadQueue,
    isDownloading,
    isModalOpen,
    startBatchDownload,
    cancelDownload,
    closeModal,
    completedCount,
    failedCount,
    exportCSV,
  };

  return (
    <TikTokContext.Provider value={value}>
      {children}
    </TikTokContext.Provider>
  );
}

// ========== HOOK ==========

export function useTikTok(): TikTokContextType {
  const context = useContext(TikTokContext);

  if (!context) {
    throw new Error('useTikTok deve ser usado dentro de TikTokProvider');
  }

  return context;
}
