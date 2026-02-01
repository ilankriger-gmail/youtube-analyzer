// ========== SECAO: TIPOS DE FILTRO UNIFICADO ==========

/**
 * Presets de periodo para filtragem
 */
export type PeriodPreset = 'all' | '7d' | '30d' | '60d' | '90d' | '180d' | '1y' | 'custom';

/**
 * Presets de duracao
 */
export type DurationPreset = 'all' | 'short' | 'medium' | 'long';
// short: < 60s, medium: 60-180s, long: > 180s

/**
 * Opcoes de ordenacao unificadas
 */
export type SortOption =
  | 'views-desc'
  | 'views-asc'
  | 'date-desc'
  | 'date-asc'
  | 'duration-desc'
  | 'duration-asc'
  | 'likes-desc'
  | 'engagement-desc';

/**
 * Estado unificado de filtros — funciona com YouTube, TikTok e Instagram
 */
export interface UnifiedFilterState {
  // Busca
  search: string;

  // Periodo
  period: PeriodPreset;
  customDateStart: string | null; // ISO string YYYY-MM-DD
  customDateEnd: string | null;

  // Views
  viewsMin: number | null;
  viewsMax: number | null;

  // Duracao (segundos)
  durationMin: number | null;
  durationMax: number | null;

  // Tipo rapido (atalho para duracao)
  durationPreset: DurationPreset;

  // Ordenacao
  sortBy: SortOption;
}

/**
 * Plataformas suportadas
 */
export type Platform = 'youtube' | 'tiktok' | 'instagram';

/**
 * Item normalizado para filtragem — adaptadores convertem para isso
 */
export interface NormalizedItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  views: number;
  likes: number;
  comments: number;
  duration: number; // segundos
}

/**
 * Estado inicial dos filtros
 */
export const INITIAL_FILTER_STATE: UnifiedFilterState = {
  search: '',
  period: 'all',
  customDateStart: null,
  customDateEnd: null,
  viewsMin: null,
  viewsMax: null,
  durationMin: null,
  durationMax: null,
  durationPreset: 'all',
  sortBy: 'views-desc',
};

// ===== Tipos legados mantidos para compatibilidade com imports existentes =====

/** @deprecated Use PeriodPreset */
export type DurationFilter = 'all' | 'short' | 'long';

/** @deprecated Use PeriodPreset */
export type DateRangePreset = '24h' | '7d' | '30d' | '90d' | '1y' | 'custom' | 'all';

/** @deprecated Use UnifiedFilterState */
export interface CustomDateRange {
  start: Date;
  end: Date;
}

/** @deprecated Use UnifiedFilterState */
export interface FilterState {
  duration: DurationFilter;
  keyword: string;
  dateRange: DateRangePreset;
  customDateRange: CustomDateRange | null;
  sortBy: SortOption;
}

/**
 * Opcao de filtro para uso em selects
 */
export interface FilterOption<T> {
  value: T;
  label: string;
  labelShort?: string;
}
