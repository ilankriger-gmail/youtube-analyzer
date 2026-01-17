// ========== SECAO: CONTEXT DE FILTROS ==========

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Video,
  FilterState,
  DurationFilter,
  DateRangePreset,
  SortOption,
  CustomDateRange,
} from '../types';
import { INITIAL_FILTER_STATE } from '../constants';
import { filterVideos } from '../utils/video.utils';
import { useVideoContext } from './VideoContext';

// ========== TIPOS ==========

interface FilterContextType {
  filters: FilterState;
  filteredVideos: Video[];
  totalCount: number;
  filteredCount: number;
  setDurationFilter: (filter: DurationFilter) => void;
  setKeyword: (keyword: string) => void;
  setDateRange: (range: DateRangePreset) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

// ========== CONTEXT ==========

const FilterContext = createContext<FilterContextType | null>(null);

// ========== PROVIDER ==========

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const { videos } = useVideoContext();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Videos filtrados (memoizado para performance)
  const filteredVideos = useMemo(() => {
    return filterVideos(videos, filters);
  }, [videos, filters]);

  // Verifica se ha filtros ativos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.duration !== 'all' ||
      filters.keyword.trim() !== '' ||
      filters.dateRange !== 'all' ||
      filters.sortBy !== 'newest'
    );
  }, [filters]);

  // ========== HANDLERS ==========

  const setDurationFilter = useCallback((duration: DurationFilter) => {
    setFilters(prev => ({ ...prev, duration }));
  }, []);

  const setKeyword = useCallback((keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
  }, []);

  const setDateRange = useCallback((dateRange: DateRangePreset) => {
    setFilters(prev => ({
      ...prev,
      dateRange,
      // Limpa range customizado se nao for 'custom'
      customDateRange: dateRange === 'custom' ? prev.customDateRange : null,
    }));
  }, []);

  const setCustomDateRange = useCallback((start: Date, end: Date) => {
    const customDateRange: CustomDateRange = { start, end };
    setFilters(prev => ({
      ...prev,
      dateRange: 'custom',
      customDateRange,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const value: FilterContextType = {
    filters,
    filteredVideos,
    totalCount: videos.length,
    filteredCount: filteredVideos.length,
    setDurationFilter,
    setKeyword,
    setDateRange,
    setCustomDateRange,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// ========== HOOK ==========

export function useFilterContext(): FilterContextType {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilterContext deve ser usado dentro de FilterProvider');
  }

  return context;
}
