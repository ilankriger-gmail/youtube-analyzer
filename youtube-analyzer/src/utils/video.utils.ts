// ========== SECAO: UTILITARIOS DE VIDEO ==========

import type { Video } from '../types';

/**
 * Retorna os N videos com mais views
 */
export function getTopViewedVideos(videos: Video[], count: number): Video[] {
  return [...videos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, count);
}

/**
 * Retorna os N videos com menos views
 */
export function getLeastViewedVideos(videos: Video[], count: number): Video[] {
  return [...videos]
    .sort((a, b) => a.viewCount - b.viewCount)
    .slice(0, count);
}

/**
 * Calcula estatisticas dos videos
 */
export function calculateVideoStats(videos: Video[]): {
  total: number;
  shorts: number;
  longs: number;
  totalViews: number;
  avgViews: number;
} {
  const shorts = videos.filter(v => v.isShort).length;

  return {
    total: videos.length,
    shorts,
    longs: videos.length - shorts,
    totalViews: videos.reduce((sum, v) => sum + v.viewCount, 0),
    avgViews: videos.length > 0
      ? Math.round(videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length)
      : 0,
  };
}
