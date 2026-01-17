// ========== SECAO: COMPONENTE DOWNLOAD MODAL ==========

import { Modal, Button, ProgressBar } from '../ui';
import { DownloadQueue } from './DownloadQueue';
import { useDownload } from '../../hooks';
import { UI_TEXT } from '../../constants';

export function DownloadModal() {
  const {
    isModalOpen,
    closeModal,
    isDownloading,
    overallProgress,
    completedCount,
    failedCount,
    queueSize,
    cancelAll,
    retryFailed,
    clearQueue,
    allCompleted,
    hasFailedDownloads,
  } = useDownload();

  const handleClose = () => {
    if (!isDownloading) {
      clearQueue();
    }
    closeModal();
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={UI_TEXT.download.modalTitle}
      size="lg"
      closeOnOverlayClick={!isDownloading}
      footer={
        <div className="flex gap-2">
          {isDownloading ? (
            <Button variant="danger" onClick={cancelAll}>
              {UI_TEXT.download.cancelAll}
            </Button>
          ) : (
            <>
              {hasFailedDownloads && (
                <Button variant="secondary" onClick={retryFailed}>
                  {UI_TEXT.download.retry}
                </Button>
              )}
              <Button onClick={handleClose}>
                {UI_TEXT.download.close}
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Status geral */}
      <div className="mb-4 p-3 bg-dark-900 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-300">
            Progresso geral
          </span>
          <span className="text-sm font-medium text-dark-100">
            {completedCount} de {queueSize} completos
          </span>
        </div>
        <ProgressBar
          progress={overallProgress}
          size="md"
          variant={allCompleted ? 'success' : 'primary'}
        />
        {failedCount > 0 && (
          <p className="mt-2 text-xs text-red-400">
            {failedCount} download(s) falharam
          </p>
        )}
      </div>

      {/* Lista de downloads */}
      <div className="max-h-[400px] overflow-y-auto">
        <DownloadQueue />
      </div>

      {/* Aviso sobre Cobalt */}
      <div className="mt-4 p-3 bg-dark-900/50 rounded-lg border border-dark-700">
        <p className="text-xs text-dark-400">
          Downloads sao processados via Cobalt API. Se algum download falhar,
          clique no icone de link externo para abrir o video no YouTube.
        </p>
      </div>
    </Modal>
  );
}
