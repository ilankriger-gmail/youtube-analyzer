// ========== SECAO: TIPOS DE FILTRO ==========

/**
 * Filtro por duracao do video
 */
export type DurationFilter = 'all' | 'short' | 'long';

/**
 * Presets de periodo para filtragem
 */
export type DateRangePreset =
  | '24h'
  | '7d'
  | '30d'
  | '90d'
  | '1y'
  | 'custom'
  | 'all';

/**
 * Periodo customizado com data inicio e fim
 */
export interface CustomDateRange {
  start: Date;
  end: Date;
}

/**
 * Opcoes de ordenacao
 */
export type SortOption =
  | 'newest'
  | 'oldest'
  | 'most_views'
  | 'least_views';

/**
 * Estado completo dos filtros
 */
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
  label: string;        // Label em portugues
  labelShort?: string;  // Label curto para mobile
}
