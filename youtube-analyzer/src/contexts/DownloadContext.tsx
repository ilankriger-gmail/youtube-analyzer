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
   * Processa download de um video
   */
  const processDownload = useCallback(async (item: DownloadQueueItem): Promise<boolean> => {
    try {
      // Atualiza status para downloading
      updateQueueItem(item.videoId, {
        status: 'downloading',
        startedAt: new Date(),
      });

      // Obtem URL de download via Cobalt
      const response = await getDownloadUrl(item.videoId);

      // Faz download com progresso
      await downloadWithProgress(
        response.url,
        item.filename,
        (progress) => {
          updateQueueItem(item.videoId, { progress });
        }
      );

      // Marca como completo
      updateQueueItem(item.videoId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      updateQueueItem(item.videoId, {
        status: 'failed',
        error: errorMessage,
      });

      console.error(`Erro ao baixar ${item.video.title}:`, error);
      return false;
    }
  }, [updateQueueItem]);

  /**
   * Inicia download de multiplos videos
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

    // Processa downloads sequencialmente
    for (const item of newItems) {
      if (controller.signal.aborted) break;

      await processDownload(item);

      // Pequeno delay entre downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [processDownload]);

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

    for (const item of failedItems) {
      if (controller.signal.aborted) break;

      await processDownload({ ...item, status: 'pending', error: undefined });

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [queue, processDownload]);

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
