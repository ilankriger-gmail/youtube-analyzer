// ========== SECAO: COMPONENTE VIDEO THUMBNAIL ==========

import type { Video } from '../../types';

interface VideoThumbnailProps {
  video: Video;
  size?: 'sm' | 'md' | 'lg';
  showDuration?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-32 h-18',
  md: 'w-full aspect-video',
  lg: 'w-full aspect-video',
};

export function VideoThumbnail({
  video,
  size = 'md',
  showDuration = true,
  className = '',
}: VideoThumbnailProps) {
  const thumbnailUrl = size === 'sm' ? video.thumbnailMediumUrl : video.thumbnailHighUrl;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-dark-700 ${sizeStyles[size]} ${className}`}>
      {/* Imagem */}
      <img
        src={thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay escuro no hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Duracao */}
      {showDuration && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
          {video.durationFormatted}
        </div>
      )}

    </div>
  );
}
