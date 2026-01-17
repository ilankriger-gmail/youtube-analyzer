// ========== SECAO: COMPONENTE EMPTY STATE ==========

import { VideoOff, Search, RefreshCw } from 'lucide-react';
import { Button } from '../ui';
import { UI_TEXT } from '../../constants';

interface EmptyStateProps {
  type: 'no-videos' | 'no-results' | 'error';
  onRetry?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

export function EmptyState({
  type,
  onRetry,
  onClearFilters,
  className = '',
}: EmptyStateProps) {
  const config = {
    'no-videos': {
      icon: VideoOff,
      title: UI_TEXT.empty.noVideos,
      description: 'Nenhum video foi encontrado neste canal.',
      action: onRetry ? (
        <Button onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          {UI_TEXT.errors.retry}
        </Button>
      ) : null,
    },
    'no-results': {
      icon: Search,
      title: UI_TEXT.empty.noResults,
      description: UI_TEXT.empty.tryAgain,
      action: onClearFilters ? (
        <Button variant="secondary" onClick={onClearFilters}>
          {UI_TEXT.filters.clear}
        </Button>
      ) : null,
    },
    'error': {
      icon: VideoOff,
      title: UI_TEXT.errors.fetchFailed,
      description: 'Ocorreu um erro ao carregar os videos.',
      action: onRetry ? (
        <Button onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          {UI_TEXT.errors.retry}
        </Button>
      ) : null,
    },
  };

  const { icon: Icon, title, description, action } = config[type];

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-dark-400" />
      </div>
      <h3 className="text-lg font-medium text-dark-200 mb-2">{title}</h3>
      <p className="text-sm text-dark-400 mb-6 text-center max-w-sm">{description}</p>
      {action}
    </div>
  );
}
