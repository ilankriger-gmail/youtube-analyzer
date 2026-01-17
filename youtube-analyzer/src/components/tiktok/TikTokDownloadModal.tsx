// ========== COMPONENTE: MODAL DE DOWNLOAD TIKTOK ==========

import { X, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTikTok } from '../../contexts';
import { formatViews } from '../../services/tiktok.service';

export function TikTokDownloadModal() {
  const {
    isModalOpen,
    closeModal,
    downloadQueue,
    isDownloading,
    cancelDownload,
    completedCount,
    failedCount,
  } = useTikTok();

  if (!isModalOpen) return null;

  const total = downloadQueue.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-bold text-white">
            {isDownloading ? 'Baixando videos...' : 'Download concluido'}
          </h2>
          <button
            onClick={closeModal}
            disabled={isDownloading}
            className="text-dark-400 hover:text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progresso geral */}
        <div className="p-4 border-b border-dark-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-400">Progresso</span>
            <span className="text-white">
              {completedCount} de {total} concluidos
              {failedCount > 0 && <span className="text-[#fe2c55]"> ({failedCount} falhas)</span>}
            </span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#25f4ee] to-[#fe2c55] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lista de downloads */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {downloadQueue.map((item) => (
            <div
              key={item.video.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg
                ${item.status === 'completed' ? 'bg-green-500/10' : ''}
                ${item.status === 'failed' ? 'bg-[#fe2c55]/10' : ''}
                ${item.status === 'downloading' ? 'bg-[#25f4ee]/10' : ''}
                ${item.status === 'pending' ? 'bg-dark-700' : ''}
              `}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {item.status === 'pending' && <Clock className="w-5 h-5 text-dark-400" />}
                {item.status === 'downloading' && <Loader2 className="w-5 h-5 text-[#25f4ee] animate-spin" />}
                {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {item.status === 'failed' && <XCircle className="w-5 h-5 text-[#fe2c55]" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate" title={item.video.title}>
                  {item.video.title}
                </p>
                <p className="text-dark-400 text-xs">
                  {formatViews(item.video.views)} views
                </p>
                {item.status === 'failed' && item.error && (
                  <p className="text-[#fe2c55] text-xs mt-1">{item.error}</p>
                )}
              </div>

              {/* Progresso individual */}
              {item.status === 'downloading' && (
                <div className="w-16 text-right">
                  <span className="text-[#25f4ee] text-sm font-medium">{item.progress}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700 flex justify-end gap-3">
          {isDownloading ? (
            <button
              onClick={cancelDownload}
              className="px-4 py-2 bg-[#fe2c55] text-white rounded hover:bg-[#fe2c55]/80 transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
