// ========== SECAO: COMPONENTE DOWNLOAD QUEUE ==========

import { DownloadProgress } from './DownloadProgress';
import { useDownload } from '../../hooks';

interface DownloadQueueProps {
  className?: string;
}

export function DownloadQueue({ className = '' }: DownloadQueueProps) {
  const { queue, getVideoUrl } = useDownload();

  if (queue.length === 0) {
    return null;
  }

  const handleOpenLink = (videoId: string) => {
    window.open(getVideoUrl(videoId), '_blank');
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {queue.map(item => (
        <DownloadProgress
          key={item.videoId}
          item={item}
          onOpenLink={() => handleOpenLink(item.videoId)}
        />
      ))}
    </div>
  );
}
