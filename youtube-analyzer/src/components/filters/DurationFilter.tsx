// ========== SECAO: COMPONENTE DURATION FILTER ==========

import { Select } from '../ui';
import { useFilters } from '../../hooks';
import { DURATION_OPTIONS, UI_TEXT } from '../../constants';

interface DurationFilterProps {
  className?: string;
}

export function DurationFilter({ className = '' }: DurationFilterProps) {
  const { filters, setDurationFilter } = useFilters();

  const options = DURATION_OPTIONS.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <Select
      label={UI_TEXT.filters.duration.label}
      value={filters.duration}
      onChange={e => setDurationFilter(e.target.value as typeof filters.duration)}
      options={options}
      className={className}
    />
  );
}
