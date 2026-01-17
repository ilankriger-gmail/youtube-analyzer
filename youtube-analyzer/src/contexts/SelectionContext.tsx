// ========== SECAO: CONTEXT DE SELECAO ==========

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { Video } from '../types';
import { MAX_SELECTION, TOP_N_COUNT } from '../constants';
import { useFilterContext } from './FilterContext';

// ========== TIPOS ==========

interface SelectionContextType {
  selectedIds: Set<string>;
  selectedVideos: Video[];
  selectionCount: number;
  maxSelection: number;
  isMaxSelected: boolean;
  toggleSelection: (videoId: string) => void;
  selectMultiple: (videoIds: string[]) => void;
  selectTopBest: (count?: number) => void;
  selectTopWorst: (count?: number) => void;
  clearSelection: () => void;
  isSelected: (videoId: string) => boolean;
  canSelect: (videoId: string) => boolean;
}

// ========== CONTEXT ==========

const SelectionContext = createContext<SelectionContextType | null>(null);

// ========== PROVIDER ==========

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const { filteredVideos } = useFilterContext();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Videos selecionados (mantendo ordem de selecao)
  const selectedVideos = useMemo(() => {
    return filteredVideos.filter(v => selectedIds.has(v.id));
  }, [filteredVideos, selectedIds]);

  const selectionCount = selectedIds.size;
  const isMaxSelected = selectionCount >= MAX_SELECTION;

  // ========== HANDLERS ==========

  /**
   * Alterna selecao de um video
   */
  const toggleSelection = useCallback((videoId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);

      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else if (newSet.size < MAX_SELECTION) {
        newSet.add(videoId);
      }

      return newSet;
    });
  }, []);

  /**
   * Seleciona multiplos videos (respeitando limite)
   */
  const selectMultiple = useCallback((videoIds: string[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      const remaining = MAX_SELECTION - newSet.size;

      videoIds.slice(0, remaining).forEach(id => {
        newSet.add(id);
      });

      return newSet;
    });
  }, []);

  /**
   * Seleciona os N videos com mais views (dos filtrados)
   * Acumula com selecao existente, respeitando limite
   */
  const selectTopBest = useCallback((count: number = TOP_N_COUNT) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      const sorted = [...filteredVideos]
        .filter(v => !newSet.has(v.id)) // Exclui ja selecionados
        .sort((a, b) => b.viewCount - a.viewCount);

      const remaining = MAX_SELECTION - newSet.size;
      sorted.slice(0, Math.min(count, remaining)).forEach(v => {
        newSet.add(v.id);
      });

      return newSet;
    });
  }, [filteredVideos]);

  /**
   * Seleciona os N videos com menos views (dos filtrados)
   * Acumula com selecao existente, respeitando limite
   */
  const selectTopWorst = useCallback((count: number = TOP_N_COUNT) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      const sorted = [...filteredVideos]
        .filter(v => !newSet.has(v.id)) // Exclui ja selecionados
        .sort((a, b) => a.viewCount - b.viewCount);

      const remaining = MAX_SELECTION - newSet.size;
      sorted.slice(0, Math.min(count, remaining)).forEach(v => {
        newSet.add(v.id);
      });

      return newSet;
    });
  }, [filteredVideos]);

  /**
   * Limpa toda a selecao
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Verifica se um video esta selecionado
   */
  const isSelected = useCallback((videoId: string) => {
    return selectedIds.has(videoId);
  }, [selectedIds]);

  /**
   * Verifica se pode selecionar mais um video
   */
  const canSelect = useCallback((videoId: string) => {
    return selectedIds.has(videoId) || selectedIds.size < MAX_SELECTION;
  }, [selectedIds]);

  const value: SelectionContextType = {
    selectedIds,
    selectedVideos,
    selectionCount,
    maxSelection: MAX_SELECTION,
    isMaxSelected,
    toggleSelection,
    selectMultiple,
    selectTopBest,
    selectTopWorst,
    clearSelection,
    isSelected,
    canSelect,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

// ========== HOOK ==========

export function useSelectionContext(): SelectionContextType {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error('useSelectionContext deve ser usado dentro de SelectionProvider');
  }

  return context;
}
