// ========== SECAO: UTILITARIOS DE VIDEO ==========

import type { Video, FilterState, DurationFilter, SortOption } from '../types';
import { isDateInRange } from './date.utils';

/**
 * Filtra videos por duracao (Short/Long/All)
 */
export function filterByDuration(videos: Video[], filter: DurationFilter): Video[] {
  switch (filter) {
    case 'short':
      return videos.filter(v => v.isShort);
    case 'long':
      return videos.filter(v => !v.isShort);
    case 'all':
    default:
      return videos;
  }
}

/**
 * Filtra videos por palavra-chave no titulo ou descricao
 */
export function filterByKeyword(videos: Video[], keyword: string): Video[] {
  if (!keyword.trim()) return videos;

  const searchTerm = keyword.toLowerCase().trim();

  return videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm) ||
    v.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Ordena videos pela opcao especificada
 */
export function sortVideos(videos: Video[], sortBy: SortOption): Video[] {
  const sorted = [...videos];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    case 'oldest':
      return sorted.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
    case 'most_views':
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case 'least_views':
      return sorted.sort((a, b) => a.viewCount - b.viewCount);
    default:
      return sorted;
  }
}

/**
 * Aplica todos os filtros aos videos
 */
export function filterVideos(videos: Video[], filters: FilterState): Video[] {
  let result = [...videos];

  // Filtro de duracao
  result = filterByDuration(result, filters.duration);

  // Filtro de palavra-chave
  result = filterByKeyword(result, filters.keyword);

  // Filtro de periodo
  result = result.filter(v =>
    isDateInRange(v.publishedAt, filters.dateRange, filters.customDateRange)
  );

  // Ordenacao
  result = sortVideos(result, filters.sortBy);

  return result;
}

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
