// ========== SECAO: COMPONENTE VIDEO GRID ==========

import { VideoCard } from './VideoCard';
import type { Video } from '../../types';

interface VideoGridProps {
  videos: Video[];
  className?: string;
}

export function VideoGrid({ videos, className = '' }: VideoGridProps) {
  return (
    <div
      className={`
        grid gap-4
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
        ${className}
      `}
    >
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
