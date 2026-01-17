// ========== SECAO: COMPONENTE VIDEO CARD ==========

import { Checkbox, Card } from '../ui';
import { VideoThumbnail } from './VideoThumbnail';
import { VideoStats } from './VideoStats';
import { useSelection } from '../../hooks';
import type { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  className?: string;
}

export function VideoCard({ video, className = '' }: VideoCardProps) {
  const { isSelected, toggleSelection } = useSelection();

  const selected = isSelected(video.id);

  const handleClick = () => {
    toggleSelection(video.id);
  };

  return (
    <Card
      variant="bordered"
      padding="none"
      hover
      className={`
        group cursor-pointer overflow-hidden
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative">
        <VideoThumbnail video={video} />

        {/* Checkbox overlay */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`
              p-1 rounded bg-dark-900/80 backdrop-blur-sm
              transition-opacity duration-200
              ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            onClick={e => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onChange={() => toggleSelection(video.id)}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Titulo */}
        <h3
          className="font-medium text-dark-100 line-clamp-2 mb-2 text-sm leading-tight"
          title={video.title}
        >
          {video.title}
        </h3>

        {/* Stats */}
        <VideoStats video={video} showIcons={false} />
      </div>
    </Card>
  );
}
