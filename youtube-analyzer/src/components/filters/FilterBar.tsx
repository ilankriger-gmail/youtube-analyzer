// ========== SECAO: COMPONENTE FILTER BAR ==========

import { X, Filter } from 'lucide-react';
import { Button } from '../ui';
import { DurationFilter } from './DurationFilter';
import { KeywordFilter } from './KeywordFilter';
import { DateFilter } from './DateFilter';
import { SortFilter } from './SortFilter';
import { useFilters } from '../../hooks';

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className = '' }: FilterBarProps) {
  const { hasActiveFilters, clearFilters, filteredCount, totalCount } = useFilters();

  return (
    <div className={`bg-dark-850 border border-dark-700 rounded-xl p-4 ${className}`}>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Busca */}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <KeywordFilter />
        </div>

        {/* Duracao */}
        <div className="w-40">
          <DurationFilter />
        </div>

        {/* Periodo */}
        <div className="w-48">
          <DateFilter />
        </div>

        {/* Ordenacao */}
        <div className="w-44">
          <SortFilter />
        </div>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="md"
            onClick={clearFilters}
            leftIcon={<X className="w-4 h-4" />}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mt-4 pt-4 border-t border-dark-700 flex items-center gap-2">
        <Filter className="w-4 h-4 text-dark-400" />
        <span className="text-sm text-dark-400">
          {filteredCount === totalCount ? (
            <>{totalCount} videos encontrados</>
          ) : (
            <>
              {filteredCount} de {totalCount} videos
              {hasActiveFilters && ' (filtrado)'}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
