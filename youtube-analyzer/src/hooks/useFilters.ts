// ========== SECAO: HOOK USE FILTERS ==========

import { useFilterContext } from '../contexts';

/**
 * Hook para acessar e manipular filtros
 */
export function useFilters() {
  const {
    filters,
    filteredVideos,
    totalCount,
    filteredCount,
    setDurationFilter,
    setKeyword,
    setDateRange,
    setCustomDateRange,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  } = useFilterContext();

  return {
    // Estado
    filters,
    filteredVideos,
    totalCount,
    filteredCount,
    hasActiveFilters,

    // Acoes
    setDurationFilter,
    setKeyword,
    setDateRange,
    setCustomDateRange,
    setSortBy,
    clearFilters,
  };
}
