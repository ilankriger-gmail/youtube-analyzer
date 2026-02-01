// ========== SECAO: COMPONENTE DATE RANGE PICKER ==========

import { useState } from 'react';
import { Button } from '../ui';
import { formatDateForInput, parseDateInput } from '../../utils/date.utils';

interface DateRangePickerProps {
  onApply: (start: Date, end: Date) => void;
  onCancel: () => void;
  initialStart?: Date;
  initialEnd?: Date;
  className?: string;
}

export function DateRangePicker({
  onApply,
  onCancel,
  initialStart,
  initialEnd,
  className = '',
}: DateRangePickerProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(
    formatDateForInput(initialStart || thirtyDaysAgo)
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(initialEnd || today)
  );

  const handleApply = () => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);

    // Garante que end seja maior que start
    if (end >= start) {
      onApply(start, end);
    }
  };

  const isValid = startDate && endDate && parseDateInput(endDate) >= parseDateInput(startDate);

  return (
    <div className={`p-4 bg-dark-800 rounded-lg border border-dark-700 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Data inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              max={endDate}
              className="
                w-full px-3 py-2
                bg-dark-900 text-dark-100
                border border-dark-600 rounded-lg
                text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Data final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate}
              max={formatDateForInput(today)}
              className="
                w-full px-3 py-2
                bg-dark-900 text-dark-100
                border border-dark-600 rounded-lg
                text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!isValid}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
