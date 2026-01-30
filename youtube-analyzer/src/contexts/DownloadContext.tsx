// ========== SECAO: CONTEXT DE DOWNLOAD ==========

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Video, DownloadQueueItem, DownloadStatus } from '../types';
import { generateFilename } from '../utils/filename.utils';
import { generateVideoCSV } from '../utils/csv.utils';
import {
  getDownloadUrl,
  downloadWithProgress,
  getYouTubeUrl,
  triggerServerDownload,
  checkServerAvailability,
} from '../services/cobalt.service';

// ========== TIPOS ==========

interface DownloadContextType {
  queue: DownloadQueueItem[];
  currentDownload: DownloadQueueItem | null;
  isDownloading: boolean;
  isModalOpen: boolean;
  overallProgress: number;
  completedCount: number;
  failedCount: number;
  startDownload: (videos: Video[]) => Promise<void>;
  cancelDownload: (videoId: string) => void;
  cancelAll: () => void;
  retryFailed: () => Promise<void>;
  clearQueue: () => void;
  openModal: () => void;
  closeModal: () => void;
  getVideoUrl: (videoId: string) => string;
}

// ========== CONTEXT ==========

const DownloadContext = createContext<DownloadContextType | null>(null);

// ========== PROVIDER ==========

interface DownloadProviderProps {
  children: ReactNode;
}

export function DownloadProvider({ children }: DownloadProviderProps) {
  const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Item atual sendo baixado
  const currentDownload = queue.find(item => item.status === 'downloading') || null;

  // Contadores
  const completedCount = queue.filter(item => item.status === 'completed').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;

  // Progresso geral (0-100)
  const overallProgress = queue.length > 0
    ? Math.round((completedCount / queue.length) * 100)
    : 0;

  /**
   * Atualiza status de um item na fila
   */
  const updateQueueItem = useCallback((
    videoId: string,
    updates: Partial<DownloadQueueItem>
  ) => {
    setQueue(prev =>
      prev.map(item =>
        item.videoId === videoId ? { ...item, ...updates } : item
      )
    );
  }, []);

  /**
   * Processa download de um video via server-side yt-dlp (iframe method).
   * Falls back to Cobalt blob download if server is unavailable.
   */
  const processDownloadServer = useCallback(async (item: DownloadQueueItem): Promise<boolean> => {
    try {
      updateQueueItem(item.videoId, {
        status: 'downloading',
        startedAt: new Date(),
        progress: 50, // Server-side doesn't report granular progress to client
      });

      await triggerServerDownload(item.videoId, item.filename);

      updateQueueItem(item.videoId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        error: undefined,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Server download failed for ${item.video.title}:`, error);

      updateQueueItem(item.videoId, {
        status: 'failed',
        error: `Server: ${errorMessage}`,
      });

      return false;
    }
  }, [updateQueueItem]);

  /**
   * Processa download de um video via Cobalt (blob method - fallback).
   * Used when server-side download is unavailable.
   */
  const processDownloadCobalt = useCallback(async (item: DownloadQueueItem): Promise<boolean> => {
    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        updateQueueItem(item.videoId, {
          status: 'downloading',
          startedAt: new Date(),
          progress: 0,
          error: attempt > 0 ? `Tentativa ${attempt + 1} (Cobalt)...` : undefined,
        });

        const response = await getDownloadUrl(item.videoId);

        await downloadWithProgress(
          response.url,
          item.filename,
          (progress) => {
            updateQueueItem(item.videoId, { progress });
          }
        );

        updateQueueItem(item.videoId, {
          status: 'completed',
          progress: 100,
          completedAt: new Date(),
          error: undefined,
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`Cobalt download error for ${item.video.title} (attempt ${attempt + 1}):`, error);

        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }

        updateQueueItem(item.videoId, {
          status: 'failed',
          error: errorMessage,
        });

        return false;
      }
    }
    return false;
  }, [updateQueueItem]);

  /**
   * Inicia download de multiplos videos.
   * Strategy: Try server-side (yt-dlp via Railway) first for reliable multi-download.
   * Falls back to Cobalt blob download if server is unavailable.
   */
  const startDownload = useCallback(async (videos: Video[]) => {
    if (videos.length === 0) return;

    // Gera CSV com dados dos videos antes de iniciar downloads
    generateVideoCSV(videos);

    // Cria itens na fila
    const newItems: DownloadQueueItem[] = videos.map(video => ({
      videoId: video.id,
      video,
      status: 'pending' as DownloadStatus,
      progress: 0,
      filename: generateFilename(video),
    }));

    setQueue(newItems);
    setIsDownloading(true);
    setIsModalOpen(true);

    const controller = new AbortController();
    setAbortController(controller);

    // Check if server-side download is available
    const serverAvailable = await checkServerAvailability();
    const useServer = serverAvailable && videos.length > 1;

    console.log(`[Download] Strategy: ${useServer ? 'SERVER (yt-dlp)' : 'COBALT (blob)'} for ${videos.length} video(s)`);

    // Processa downloads sequencialmente
    for (let i = 0; i < newItems.length; i++) {
      if (controller.signal.aborted) break;

      const item = newItems[i];

      if (useServer) {
        const success = await processDownloadServer(item);
        if (!success) {
          // Fallback to Cobalt for this specific video
          console.log(`[Download] Server failed for ${item.videoId}, trying Cobalt fallback...`);
          await processDownloadCobalt(item);
        }
      } else {
        await processDownloadCobalt(item);
      }

      // Delay between downloads: longer for multi-video to avoid browser throttling
      if (i < newItems.length - 1) {
        const delay = useServer ? 8000 : 3000; // 8s for server (yt-dlp processing time), 3s for Cobalt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [processDownloadServer, processDownloadCobalt]);

  /**
   * Cancela download de um video especifico
   */
  const cancelDownload = useCallback((videoId: string) => {
    updateQueueItem(videoId, {
      status: 'failed',
      error: 'Cancelado pelo usuario',
    });
  }, [updateQueueItem]);

  /**
   * Cancela todos os downloads
   */
  const cancelAll = useCallback(() => {
    abortController?.abort();

    setQueue(prev =>
      prev.map(item =>
        item.status === 'pending' || item.status === 'downloading'
          ? { ...item, status: 'failed', error: 'Cancelado pelo usuario' }
          : item
      )
    );

    setIsDownloading(false);
  }, [abortController]);

  /**
   * Tenta novamente os downloads que falharam
   */
  const retryFailed = useCallback(async () => {
    const failedItems = queue.filter(item => item.status === 'failed');

    if (failedItems.length === 0) return;

    // Reseta status dos falhos
    setQueue(prev =>
      prev.map(item =>
        item.status === 'failed'
          ? { ...item, status: 'pending', error: undefined, progress: 0 }
          : item
      )
    );

    setIsDownloading(true);

    const controller = new AbortController();
    setAbortController(controller);

    // Check server availability for retries too
    const serverAvailable = await checkServerAvailability();
    const useServer = serverAvailable && failedItems.length > 1;

    for (let i = 0; i < failedItems.length; i++) {
      if (controller.signal.aborted) break;

      const item = { ...failedItems[i], status: 'pending' as DownloadStatus, error: undefined };

      if (useServer) {
        const success = await processDownloadServer(item);
        if (!success) {
          await processDownloadCobalt(item);
        }
      } else {
        await processDownloadCobalt(item);
      }

      if (i < failedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, useServer ? 8000 : 3000));
      }
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [queue, processDownloadServer, processDownloadCobalt]);

  /**
   * Limpa a fila
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const value: DownloadContextType = {
    queue,
    currentDownload,
    isDownloading,
    isModalOpen,
    overallProgress,
    completedCount,
    failedCount,
    startDownload,
    cancelDownload,
    cancelAll,
    retryFailed,
    clearQueue,
    openModal,
    closeModal,
    getVideoUrl: getYouTubeUrl,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}

// ========== HOOK ==========

export function useDownloadContext(): DownloadContextType {
  const context = useContext(DownloadContext);

  if (!context) {
    throw new Error('useDownloadContext deve ser usado dentro de DownloadProvider');
  }

  return context;
}
