// ========== SECAO: CONTEXT DE FILTROS UNIFICADO ==========

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { Video } from '../types';
import type { UnifiedFilterState } from '../types/filter.types';
import { INITIAL_FILTER_STATE } from '../types/filter.types';
import { applyYouTubeFilters, hasActiveFilters as checkActiveFilters } from '../utils/filter.utils';
import { useVideoContext } from './VideoContext';

// ========== TIPOS ==========

interface FilterContextType {
  filters: UnifiedFilterState;
  filteredVideos: Video[];
  totalCount: number;
  filteredCount: number;
  updateFilters: (partial: Partial<UnifiedFilterState>) => void;
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
  const [filters, setFilters] = useState<UnifiedFilterState>(INITIAL_FILTER_STATE);

  // Videos filtrados (memoizado)
  const filteredVideos = useMemo(() => {
    return applyYouTubeFilters(videos, filters);
  }, [videos, filters]);

  const hasActiveFilters = useMemo(() => checkActiveFilters(filters), [filters]);

  const updateFilters = useCallback((partial: Partial<UnifiedFilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const value: FilterContextType = {
    filters,
    filteredVideos,
    totalCount: videos.length,
    filteredCount: filteredVideos.length,
    updateFilters,
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
