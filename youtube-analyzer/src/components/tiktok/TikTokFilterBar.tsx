// ========== COMPONENTE: BARRA DE FILTROS TIKTOK ==========

import { useTikTok } from '../../contexts';
import { UnifiedFilterBar } from '../filters/UnifiedFilterBar';

export function TikTokFilterBar() {
  const { filters, updateFilters, resetFilters, hasActiveFilters, totalCount, filteredCount } = useTikTok();

  return (
    <UnifiedFilterBar
      platform="tiktok"
      filters={filters}
      onChange={updateFilters}
      onClear={resetFilters}
      totalCount={totalCount}
      filteredCount={filteredCount}
      hasActiveFilters={hasActiveFilters}
      accentColor="#fe2c55"
    />
  );
}
