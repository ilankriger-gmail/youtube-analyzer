// ========== SECAO: HOOK USE DOWNLOAD ==========

import { useDownloadContext } from '../contexts';

/**
 * Hook para gerenciar downloads
 */
export function useDownload() {
  const {
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
    getVideoUrl,
  } = useDownloadContext();

  // Status resumido
  const hasFailedDownloads = failedCount > 0;
  const hasCompletedDownloads = completedCount > 0;
  const allCompleted = queue.length > 0 && completedCount === queue.length;
  const queueSize = queue.length;

  return {
    // Estado
    queue,
    currentDownload,
    isDownloading,
    isModalOpen,
    overallProgress,
    completedCount,
    failedCount,
    queueSize,

    // Status derivados
    hasFailedDownloads,
    hasCompletedDownloads,
    allCompleted,

    // Acoes
    startDownload,
    cancelDownload,
    cancelAll,
    retryFailed,
    clearQueue,
    openModal,
    closeModal,
    getVideoUrl,
  };
}
