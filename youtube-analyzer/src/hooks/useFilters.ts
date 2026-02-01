// ========== SECAO: HOOK USE FILTERS ==========

import { useFilterContext } from '../contexts';

/**
 * Hook para acessar e manipular filtros unificados
 */
export function useFilters() {
  const {
    filters,
    filteredVideos,
    totalCount,
    filteredCount,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  } = useFilterContext();

  return {
    filters,
    filteredVideos,
    totalCount,
    filteredCount,
    hasActiveFilters,
    updateFilters,
    clearFilters,
  };
}
