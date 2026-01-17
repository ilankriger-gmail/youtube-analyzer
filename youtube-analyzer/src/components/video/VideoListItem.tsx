// ========== SECAO: COMPONENTE VIDEO LIST ITEM ==========

import { Checkbox } from '../ui';
import { VideoStats } from './VideoStats';
import { useSelection } from '../../hooks';
import { formatViewsCompact } from '../../utils/number.utils';
import type { Video } from '../../types';

interface VideoListItemProps {
  video: Video;
  className?: string;
}

export function VideoListItem({ video, className = '' }: VideoListItemProps) {
  const { isSelected, canSelect, toggleSelection } = useSelection();

  const selected = isSelected(video.id);
  const canSelectThis = canSelect(video.id);
  const isDisabled = !canSelectThis && !selected;

  const handleClick = () => {
    if (!isDisabled) {
      toggleSelection(video.id);
    }
  };

  return (
    <div
      className={`
        flex items-center gap-4 p-3
        bg-dark-800 rounded-lg border border-dark-700
        cursor-pointer transition-all duration-200
        hover:bg-dark-750 hover:border-dark-600
        ${selected ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Checkbox */}
      <div onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onChange={() => toggleSelection(video.id)}
          disabled={isDisabled}
        />
      </div>

      {/* Thumbnail */}
      <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-dark-700">
        <img
          src={video.thumbnailMediumUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Duracao */}
        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
          {video.durationFormatted}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-medium text-dark-100 line-clamp-1 text-sm mb-1"
          title={video.title}
        >
          {video.title}
        </h3>
        <VideoStats video={video} showIcons={false} />
      </div>

      {/* Views destacado */}
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-semibold text-dark-100">
          {formatViewsCompact(video.viewCount)}
        </div>
        <div className="text-xs text-dark-400">views</div>
      </div>
    </div>
  );
}
