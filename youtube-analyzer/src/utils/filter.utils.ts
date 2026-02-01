// ========== SECAO: UTILITARIOS DE FILTRO UNIFICADO ==========

import type { UnifiedFilterState, NormalizedItem } from '../types/filter.types';
import type { Video } from '../types/video.types';
import type { TikTokVideo } from '../services/tiktok.service';

// ========== ADAPTADORES POR PLATAFORMA ==========

/**
 * Adapta video do YouTube para formato normalizado
 */
export function youtubeAdapter(video: Video): NormalizedItem {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    date: video.publishedAt instanceof Date ? video.publishedAt : new Date(video.publishedAt),
    views: video.viewCount,
    likes: video.likeCount,
    comments: video.commentCount,
    duration: video.duration,
  };
}

/**
 * Adapta video do TikTok para formato normalizado
 */
export function tiktokAdapter(video: TikTokVideo): NormalizedItem {
  // TikTok uploadDate vem como "YYYYMMDD"
  const dateStr = video.uploadDate;
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const date = new Date(year, month, day);

  return {
    id: video.id,
    title: video.title,
    description: '',
    date: isNaN(date.getTime()) ? new Date(0) : date,
    views: video.views,
    likes: 0,
    comments: 0,
    duration: video.duration,
  };
}

// ========== DURACAO PRESETS ==========

const DURATION_PRESET_RANGES: Record<string, { min: number; max: number }> = {
  short: { min: 0, max: 60 },
  medium: { min: 60, max: 180 },
  long: { min: 180, max: Infinity },
};

// ========== PERIODO ==========

function getPeriodCutoff(period: string): Date | null {
  if (period === 'all' || period === 'custom') return null;

  const now = new Date();
  const map: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '60d': 60,
    '90d': 90,
    '180d': 180,
    '1y': 365,
  };

  const days = map[period];
  if (!days) return null;

  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// ========== FUNCAO PRINCIPAL ==========

/**
 * Aplica filtros unificados a um array de itens normalizados.
 * Pura: nao modifica os arrays originais.
 */
export function applyUnifiedFilters(
  items: NormalizedItem[],
  filters: UnifiedFilterState,
): NormalizedItem[] {
  let result = [...items];

  // 1. Busca por texto
  if (filters.search.trim()) {
    const search = filters.search.toLowerCase().trim();
    result = result.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    );
  }

  // 2. Periodo
  if (filters.period === 'custom') {
    if (filters.customDateStart) {
      const start = new Date(filters.customDateStart);
      result = result.filter(item => item.date >= start);
    }
    if (filters.customDateEnd) {
      const end = new Date(filters.customDateEnd + 'T23:59:59');
      result = result.filter(item => item.date <= end);
    }
  } else {
    const cutoff = getPeriodCutoff(filters.period);
    if (cutoff) {
      result = result.filter(item => item.date >= cutoff);
    }
  }

  // 3. Views
  if (filters.viewsMin !== null) {
    result = result.filter(item => item.views >= filters.viewsMin!);
  }
  if (filters.viewsMax !== null) {
    result = result.filter(item => item.views <= filters.viewsMax!);
  }

  // 4. Duracao (preset ou manual)
  if (filters.durationPreset !== 'all') {
    const range = DURATION_PRESET_RANGES[filters.durationPreset];
    if (range) {
      result = result.filter(item =>
        item.duration >= range.min && item.duration < range.max
      );
    }
  } else {
    if (filters.durationMin !== null) {
      result = result.filter(item => item.duration >= filters.durationMin!);
    }
    if (filters.durationMax !== null) {
      result = result.filter(item => item.duration <= filters.durationMax!);
    }
  }

  // 5. Ordenacao
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'views-desc': return b.views - a.views;
      case 'views-asc': return a.views - b.views;
      case 'date-desc': return b.date.getTime() - a.date.getTime();
      case 'date-asc': return a.date.getTime() - b.date.getTime();
      case 'duration-desc': return b.duration - a.duration;
      case 'duration-asc': return a.duration - b.duration;
      case 'likes-desc': return b.likes - a.likes;
      case 'engagement-desc':
        return (b.likes + b.comments) - (a.likes + a.comments);
      default: return 0;
    }
  });

  return result;
}

// ========== WRAPPERS TIPADOS POR PLATAFORMA ==========

/**
 * Aplica filtros em videos do YouTube. Retorna os IDs filtrados na ordem correta.
 */
export function applyYouTubeFilters(
  videos: Video[],
  filters: UnifiedFilterState,
): Video[] {
  const normalized = videos.map(youtubeAdapter);
  const filtered = applyUnifiedFilters(normalized, filters);
  const idOrder = new Map(filtered.map((item, idx) => [item.id, idx]));

  return videos
    .filter(v => idOrder.has(v.id))
    .sort((a, b) => idOrder.get(a.id)! - idOrder.get(b.id)!);
}

/**
 * Aplica filtros em videos do TikTok. Retorna os IDs filtrados na ordem correta.
 */
export function applyTikTokFilters(
  videos: TikTokVideo[],
  filters: UnifiedFilterState,
): TikTokVideo[] {
  const normalized = videos.map(tiktokAdapter);
  const filtered = applyUnifiedFilters(normalized, filters);
  const idOrder = new Map(filtered.map((item, idx) => [item.id, idx]));

  return videos
    .filter(v => idOrder.has(v.id))
    .sort((a, b) => idOrder.get(a.id)! - idOrder.get(b.id)!);
}

/**
 * Verifica se ha filtros ativos (diferente do default)
 */
export function hasActiveFilters(filters: UnifiedFilterState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.period !== 'all' ||
    filters.viewsMin !== null ||
    filters.viewsMax !== null ||
    filters.durationMin !== null ||
    filters.durationMax !== null ||
    filters.durationPreset !== 'all' ||
    filters.sortBy !== 'views-desc'
  );
}
