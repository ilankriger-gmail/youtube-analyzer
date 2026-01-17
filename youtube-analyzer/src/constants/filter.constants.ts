// ========== SECAO: CONSTANTES DE FILTRO ==========

import type { FilterOption, DurationFilter, DateRangePreset, SortOption } from '../types';

/**
 * Opcoes de filtro por duracao
 */
export const DURATION_OPTIONS: FilterOption<DurationFilter>[] = [
  { value: 'all', label: 'Todos', labelShort: 'Todos' },
  { value: 'short', label: 'Shorts (< 3min)', labelShort: 'Shorts' },
  { value: 'long', label: 'Longos (> 3min)', labelShort: 'Longos' },
];

/**
 * Opcoes de filtro por periodo
 */
export const DATE_RANGE_OPTIONS: FilterOption<DateRangePreset>[] = [
  { value: 'all', label: 'Todo o periodo', labelShort: 'Todos' },
  { value: '24h', label: 'Ultimas 24 horas', labelShort: '24h' },
  { value: '7d', label: 'Ultimos 7 dias', labelShort: '7 dias' },
  { value: '30d', label: 'Ultimos 30 dias', labelShort: '30 dias' },
  { value: '90d', label: 'Ultimos 90 dias', labelShort: '90 dias' },
  { value: '1y', label: 'Ultimo ano', labelShort: '1 ano' },
  { value: 'custom', label: 'Periodo personalizado', labelShort: 'Custom' },
];

/**
 * Opcoes de ordenacao
 */
export const SORT_OPTIONS: FilterOption<SortOption>[] = [
  { value: 'newest', label: 'Mais recentes', labelShort: 'Recentes' },
  { value: 'oldest', label: 'Mais antigos', labelShort: 'Antigos' },
  { value: 'most_views', label: 'Mais visualizacoes', labelShort: '+ Views' },
  { value: 'least_views', label: 'Menos visualizacoes', labelShort: '- Views' },
];

/**
 * Estado inicial dos filtros
 */
export const INITIAL_FILTER_STATE = {
  duration: 'all' as DurationFilter,
  keyword: '',
  dateRange: 'all' as DateRangePreset,
  customDateRange: null,
  sortBy: 'most_views' as SortOption,
};
