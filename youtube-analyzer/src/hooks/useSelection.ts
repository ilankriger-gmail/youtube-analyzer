// ========== SECAO: HOOK USE SELECTION ==========

import { useSelectionContext } from '../contexts';

/**
 * Hook para gerenciar selecao de videos
 */
export function useSelection() {
  const {
    selectedIds,
    selectedVideos,
    selectionCount,
    maxSelection,
    isMaxSelected,
    toggleSelection,
    selectMultiple,
    selectTopBest,
    selectTopWorst,
    clearSelection,
    isSelected,
    canSelect,
  } = useSelectionContext();

  return {
    // Estado
    selectedIds,
    selectedVideos,
    selectionCount,
    maxSelection,
    isMaxSelected,

    // Acoes
    toggleSelection,
    selectMultiple,
    selectTopBest,
    selectTopWorst,
    clearSelection,

    // Checagens
    isSelected,
    canSelect,
  };
}
