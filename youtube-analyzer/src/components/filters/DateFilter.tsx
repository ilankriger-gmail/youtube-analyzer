// ========== SECAO: COMPONENTE DATE FILTER ==========

import { useState } from 'react';
import { Select } from '../ui';
import { DateRangePicker } from './DateRangePicker';
import { useFilters } from '../../hooks';
import { DATE_RANGE_OPTIONS, UI_TEXT } from '../../constants';
import type { DateRangePreset } from '../../types';

interface DateFilterProps {
  className?: string;
}

export function DateFilter({ className = '' }: DateFilterProps) {
  const { filters, setDateRange, setCustomDateRange } = useFilters();
  const [showPicker, setShowPicker] = useState(false);

  const options = DATE_RANGE_OPTIONS.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  const handleChange = (value: string) => {
    const preset = value as DateRangePreset;

    if (preset === 'custom') {
      setShowPicker(true);
    } else {
      setShowPicker(false);
      setDateRange(preset);
    }
  };

  const handleApplyCustom = (start: Date, end: Date) => {
    setCustomDateRange(start, end);
    setShowPicker(false);
  };

  const handleCancelCustom = () => {
    setShowPicker(false);
    // Volta para 'all' se cancelar
    if (filters.dateRange === 'custom' && !filters.customDateRange) {
      setDateRange('all');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Select
        label={UI_TEXT.filters.date.label}
        value={filters.dateRange}
        onChange={e => handleChange(e.target.value)}
        options={options}
      />

      {showPicker && (
        <div className="absolute top-full left-0 mt-2 z-20 min-w-[300px]">
          <DateRangePicker
            onApply={handleApplyCustom}
            onCancel={handleCancelCustom}
            initialStart={filters.customDateRange?.start}
            initialEnd={filters.customDateRange?.end}
          />
        </div>
      )}
    </div>
  );
}
