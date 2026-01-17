// ========== SECAO: COMPONENTE VIDEO LIST ==========

import { VideoListItem } from './VideoListItem';
import type { Video } from '../../types';

interface VideoListProps {
  videos: Video[];
  className?: string;
}

export function VideoList({ videos, className = '' }: VideoListProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {videos.map(video => (
        <VideoListItem key={video.id} video={video} />
      ))}
    </div>
  );
}
