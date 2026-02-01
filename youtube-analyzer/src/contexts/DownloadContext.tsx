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
  getYouTubeUrl,
  getServerDownloadUrl,
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
   * Download via servidor yt-dlp (Railway) — fetch+blob pra garantir que completa
   */
  const processDownloadServer = useCallback(async (item: DownloadQueueItem): Promise<boolean> => {
    try {
      updateQueueItem(item.videoId, {
        status: 'downloading',
        startedAt: new Date(),
        progress: 0,
      });

      const url = getServerDownloadUrl(item.videoId, item.filename, '720');
      console.log(`[Download] Fetch+blob: ${item.video.title}`);

      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errData.details || errData.error || `HTTP ${response.status}`);
      }

      // Verificar content-type
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        const errData = await response.json().catch(() => ({ error: 'Resposta inesperada' }));
        throw new Error(errData.details || errData.error || 'Servidor retornou erro');
      }

      // Ler com progresso
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();

      if (!reader) throw new Error('Response body não disponível');

      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;

        if (total > 0) {
          const pct = Math.round((received / total) * 100);
          updateQueueItem(item.videoId, { progress: pct });
        }
      }

      // Verificar tamanho mínimo
      if (received < 50000) {
        throw new Error(`Arquivo muito pequeno (${Math.round(received / 1024)}KB)`);
      }

      // Criar blob e disparar download
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      console.log(`[Download] Concluído: ${item.filename} (${Math.round(received / 1024 / 1024)}MB)`);

      updateQueueItem(item.videoId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        error: undefined,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Server download error for ${item.video.title}:`, errorMessage);
      updateQueueItem(item.videoId, {
        status: 'failed',
        error: errorMessage,
      });
      return false;
    }
  }, [updateQueueItem]);

  /**
   * Inicia download de multiplos videos.
   * Usa o mesmo processo pra cada video (Cobalt), um por vez, sequencial.
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

    console.log(`[Download] Iniciando ${videos.length} video(s) — yt-dlp server (Railway)`);

    // Processa downloads sequencialmente via yt-dlp server (mais confiável)
    for (let i = 0; i < newItems.length; i++) {
      if (controller.signal.aborted) break;

      await processDownloadServer(newItems[i]);

      // Delay de 2s entre downloads
      if (i < newItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [processDownloadServer]);

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

    for (let i = 0; i < failedItems.length; i++) {
      if (controller.signal.aborted) break;

      const item = { ...failedItems[i], status: 'pending' as DownloadStatus, error: undefined };
      await processDownloadServer(item);

      if (i < failedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsDownloading(false);
    setAbortController(null);
  }, [queue, processDownloadServer]);

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
