// ========== SECAO: COMPONENTE DOWNLOAD BUTTON ==========

import { Download } from 'lucide-react';
import { Button } from '../ui';
import { useSelection, useDownload } from '../../hooks';
import { UI_TEXT } from '../../constants';

interface DownloadButtonProps {
  className?: string;
}

export function DownloadButton({ className = '' }: DownloadButtonProps) {
  const { selectedVideos, selectionCount } = useSelection();
  const { startDownload, isDownloading, openModal } = useDownload();

  const handleClick = () => {
    if (isDownloading) {
      openModal();
    } else if (selectedVideos.length > 0) {
      startDownload(selectedVideos);
    }
  };

  const buttonText = isDownloading
    ? 'Ver progresso'
    : selectionCount > 0
    ? UI_TEXT.download.buttonWithCount(selectionCount)
    : UI_TEXT.download.button;

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={selectionCount === 0 && !isDownloading}
      isLoading={isDownloading}
      leftIcon={!isDownloading ? <Download className="w-4 h-4" /> : undefined}
      className={className}
    >
      {buttonText}
    </Button>
  );
}
