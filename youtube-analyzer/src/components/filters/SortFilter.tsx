// ========== SECAO: COMPONENTE SORT FILTER ==========

import { Select } from '../ui';
import { useFilters } from '../../hooks';
import { SORT_OPTIONS, UI_TEXT } from '../../constants';
import type { SortOption } from '../../types';

interface SortFilterProps {
  className?: string;
}

export function SortFilter({ className = '' }: SortFilterProps) {
  const { filters, setSortBy } = useFilters();

  const options = SORT_OPTIONS.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <Select
      label={UI_TEXT.filters.sort.label}
      value={filters.sortBy}
      onChange={e => setSortBy(e.target.value as SortOption)}
      options={options}
      className={className}
    />
  );
}
