// ========== SECAO: COMPONENTE DOWNLOAD PROGRESS ==========

import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ProgressBar, Button } from '../ui';
import type { DownloadQueueItem } from '../../types';
import { UI_TEXT } from '../../constants';

interface DownloadProgressProps {
  item: DownloadQueueItem;
  onRetry?: () => void;
  onOpenLink?: () => void;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Aguardando',
    color: 'text-dark-400',
    bgColor: 'bg-dark-700',
  },
  downloading: {
    icon: Loader2,
    label: UI_TEXT.download.downloading,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
  },
  processing: {
    icon: Loader2,
    label: UI_TEXT.download.processing,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  completed: {
    icon: CheckCircle,
    label: UI_TEXT.download.completed,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  failed: {
    icon: XCircle,
    label: UI_TEXT.download.failed,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
};

export function DownloadProgress({
  item,
  onRetry,
  onOpenLink,
  className = '',
}: DownloadProgressProps) {
  const config = statusConfig[item.status];
  const Icon = config.icon;
  const isAnimated = item.status === 'downloading' || item.status === 'processing';

  return (
    <div
      className={`
        p-3 bg-dark-800 rounded-lg border border-dark-700
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail pequena */}
        <div className="w-16 h-10 flex-shrink-0 rounded overflow-hidden bg-dark-700">
          <img
            src={item.video.thumbnailUrl}
            alt={item.video.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-dark-100 truncate">
              {item.video.title}
            </h4>
          </div>

          {/* Status e Progress */}
          <div className="flex items-center gap-2 mb-2">
            <Icon
              className={`w-4 h-4 ${config.color} ${isAnimated ? 'animate-spin' : ''}`}
            />
            <span className={`text-xs ${config.color}`}>{config.label}</span>
            {item.status === 'downloading' && (
              <span className="text-xs text-dark-400">{item.progress}%</span>
            )}
          </div>

          {/* Barra de progresso */}
          {(item.status === 'downloading' || item.status === 'processing') && (
            <ProgressBar
              progress={item.progress}
              size="sm"
              variant={item.status === 'processing' ? 'success' : 'primary'}
            />
          )}

          {/* Erro */}
          {item.status === 'failed' && item.error && (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-red-400 flex-1">{item.error}</p>
              {onRetry && (
                <Button variant="ghost" size="sm" onClick={onRetry}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
              {onOpenLink && (
                <Button variant="ghost" size="sm" onClick={onOpenLink}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Nome do arquivo */}
          {item.status === 'completed' && (
            <p className="text-xs text-dark-500 truncate">{item.filename}</p>
          )}
        </div>
      </div>
    </div>
  );
}
