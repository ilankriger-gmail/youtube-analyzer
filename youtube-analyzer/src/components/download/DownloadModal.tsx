// ========== SECAO: COMPONENTE DOWNLOAD MODAL ==========

import { useState } from 'react';
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
    queue,
    getVideoUrl,
  } = useDownload();

  const [copiedAll, setCopiedAll] = useState(false);

  const handleClose = () => {
    if (!isDownloading) {
      clearQueue();
    }
    closeModal();
  };

  const videoLinks = queue.map(item => ({
    title: item.video.title,
    url: getVideoUrl(item.videoId),
    videoId: item.videoId,
  }));

  const handleCopyAllLinks = async () => {
    const linksText = videoLinks.map((l, i) => `${i + 1}. ${l.title}\n   ${l.url}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(linksText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback: select text
      const textarea = document.createElement('textarea');
      textarea.value = linksText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // silent fail
    }
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
      {/* Links dos videos selecionados */}
      {videoLinks.length > 0 && (
        <div className="mb-4 p-3 bg-dark-900 rounded-lg border border-dark-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-dark-100">
              🔗 Links dos vídeos ({videoLinks.length})
            </span>
            <button
              onClick={handleCopyAllLinks}
              className="text-xs px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              {copiedAll ? '✅ Copiado!' : '📋 Copiar todos'}
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
            {videoLinks.map((link, i) => (
              <div
                key={link.videoId}
                className="flex items-center gap-2 p-2 rounded bg-dark-800 hover:bg-dark-700 transition-colors group"
              >
                <span className="text-xs text-dark-500 w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 truncate flex-1"
                  title={link.title}
                >
                  {link.title}
                </a>
                <button
                  onClick={() => handleCopyLink(link.url)}
                  className="text-xs text-dark-500 hover:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title="Copiar link"
                >
                  📋
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-dark-500 hover:text-dark-200 shrink-0"
                  title="Abrir no YouTube"
                >
                  ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

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
          use os links acima para abrir os videos diretamente.
        </p>
      </div>
    </Modal>
  );
}
