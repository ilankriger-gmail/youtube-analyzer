// ========== COMPONENTE: STATUS DA SINCRONIZACAO ==========

import { Database, Cloud, HardDrive } from 'lucide-react';
import { useVideoContext } from '../../contexts/VideoContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncStatus({ className = '', showLabel = true }: SyncStatusProps) {
  const { dataSource, lastDatabaseSync, isDatabaseAvailable } = useVideoContext();

  // Icone e cor baseados na fonte dos dados
  const getSourceInfo = () => {
    switch (dataSource) {
      case 'database':
        return {
          icon: <Database className="w-3.5 h-3.5" />,
          label: 'Banco de Dados',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      case 'cache':
        return {
          icon: <HardDrive className="w-3.5 h-3.5" />,
          label: 'Cache Local',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      case 'api':
        return {
          icon: <Cloud className="w-3.5 h-3.5" />,
          label: 'YouTube API',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
    }
  };

  const sourceInfo = getSourceInfo();

  // Formata tempo desde ultima sync
  const getLastSyncText = () => {
    if (!lastDatabaseSync) return null;

    return formatDistanceToNow(lastDatabaseSync, {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const lastSyncText = getLastSyncText();

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
        ${sourceInfo.bgColor} ${sourceInfo.borderColor} border
        ${className}
      `}
      title={
        lastSyncText
          ? `Fonte: ${sourceInfo.label} | Ultima sync: ${lastSyncText}`
          : `Fonte: ${sourceInfo.label}`
      }
    >
      <span className={sourceInfo.color}>{sourceInfo.icon}</span>
      {showLabel && (
        <span className={`${sourceInfo.color} font-medium`}>
          {sourceInfo.label}
        </span>
      )}
      {lastSyncText && dataSource === 'database' && (
        <span className="text-dark-400 ml-1">({lastSyncText})</span>
      )}
      {!isDatabaseAvailable && dataSource !== 'database' && (
        <span className="text-dark-500 ml-1">(DB offline)</span>
      )}
    </div>
  );
}
