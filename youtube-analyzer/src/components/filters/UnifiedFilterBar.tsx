// ========== SECAO: BARRA DE FILTROS UNIFICADA ==========

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import type { UnifiedFilterState, PeriodPreset, DurationPreset, SortOption, Platform } from '../../types/filter.types';

// ========== TIPOS ==========

interface UnifiedFilterBarProps {
  platform: Platform;
  filters: UnifiedFilterState;
  onChange: (filters: Partial<UnifiedFilterState>) => void;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  accentColor?: string; // ex: '#fe2c55' para TikTok, '#ff0000' para YouTube
}

// ========== OPCOES ==========

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'all', label: 'Todo período' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '60d', label: '60 dias' },
  { value: '90d', label: '90 dias' },
  { value: '180d', label: '180 dias' },
  { value: '1y', label: '1 ano' },
  { value: 'custom', label: 'Personalizado' },
];

const DURATION_PRESETS: { value: DurationPreset; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'short', label: '< 1min' },
  { value: 'medium', label: '1-3min' },
  { value: 'long', label: '> 3min' },
];

const SORT_OPTIONS: { value: SortOption; label: string; platforms: Platform[] }[] = [
  { value: 'views-desc', label: 'Mais views', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'views-asc', label: 'Menos views', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'date-desc', label: 'Mais recente', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'date-asc', label: 'Mais antigo', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'duration-desc', label: 'Maior duração', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'duration-asc', label: 'Menor duração', platforms: ['youtube', 'tiktok', 'instagram'] },
  { value: 'likes-desc', label: 'Mais likes', platforms: ['youtube'] },
  { value: 'engagement-desc', label: 'Mais engajamento', platforms: ['youtube'] },
];

// ========== DROPDOWN HELPER ==========

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return { isOpen, setIsOpen, ref };
}

// ========== COMPONENTE ==========

export function UnifiedFilterBar({
  platform,
  filters,
  onChange,
  onClear,
  totalCount,
  filteredCount,
  hasActiveFilters,
  accentColor: _accentColor = '#3b82f6',
}: UnifiedFilterBarProps) {
  // accentColor reserved for future per-platform styling
  void _accentColor;
  const period = useDropdown();
  const views = useDropdown();
  const duration = useDropdown();
  const sort = useDropdown();

  // Local state para inputs de views (aplicam no blur/enter)
  const [viewsMinInput, setViewsMinInput] = useState(filters.viewsMin?.toString() ?? '');
  const [viewsMaxInput, setViewsMaxInput] = useState(filters.viewsMax?.toString() ?? '');
  const [durationMinInput, setDurationMinInput] = useState(filters.durationMin?.toString() ?? '');
  const [durationMaxInput, setDurationMaxInput] = useState(filters.durationMax?.toString() ?? '');

  // Sync local inputs when filters reset externally
  useEffect(() => {
    setViewsMinInput(filters.viewsMin?.toString() ?? '');
    setViewsMaxInput(filters.viewsMax?.toString() ?? '');
    setDurationMinInput(filters.durationMin?.toString() ?? '');
    setDurationMaxInput(filters.durationMax?.toString() ?? '');
  }, [filters.viewsMin, filters.viewsMax, filters.durationMin, filters.durationMax]);

  const applyViews = useCallback(() => {
    onChange({
      viewsMin: viewsMinInput ? parseInt(viewsMinInput) : null,
      viewsMax: viewsMaxInput ? parseInt(viewsMaxInput) : null,
    });
  }, [viewsMinInput, viewsMaxInput, onChange]);

  const applyDuration = useCallback(() => {
    onChange({
      durationMin: durationMinInput ? parseInt(durationMinInput) : null,
      durationMax: durationMaxInput ? parseInt(durationMaxInput) : null,
      durationPreset: 'all', // manual override cancels preset
    });
  }, [durationMinInput, durationMaxInput, onChange]);

  const sortOptions = SORT_OPTIONS.filter(o => o.platforms.includes(platform));
  const currentSortLabel = sortOptions.find(o => o.value === filters.sortBy)?.label ?? 'Ordenar';
  const currentPeriodLabel = PERIOD_OPTIONS.find(o => o.value === filters.period)?.label ?? 'Período';

  // Badge helpers
  const hasPeriodFilter = filters.period !== 'all';
  const hasViewsFilter = filters.viewsMin !== null || filters.viewsMax !== null;
  const hasDurationFilter = filters.durationPreset !== 'all' || filters.durationMin !== null || filters.durationMax !== null;
  const hasSortFilter = filters.sortBy !== 'views-desc';

  return (
    <div className="bg-dark-850 border border-dark-700 rounded-xl p-4 mb-4">
      {/* Row: Search + Dropdowns */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Busca */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Buscar por título..."
            className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-dark-400"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Periodo Dropdown */}
        <div className="relative" ref={period.ref}>
          <button
            onClick={() => period.setIsOpen(!period.isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
              hasPeriodFilter
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-dark-700 border-dark-600 text-dark-200 hover:border-dark-500'
            }`}
          >
            <span>{currentPeriodLabel}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {period.isOpen && (
            <div className="absolute top-full mt-1 left-0 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 min-w-[200px] py-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange({ period: opt.value });
                    if (opt.value !== 'custom') period.setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-dark-700 transition-colors ${
                    filters.period === opt.value ? 'text-blue-400' : 'text-dark-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              {/* Custom date inputs */}
              {filters.period === 'custom' && (
                <div className="px-3 py-2 border-t border-dark-600 flex flex-col gap-2">
                  <input
                    type="date"
                    value={filters.customDateStart ?? ''}
                    onChange={(e) => onChange({ customDateStart: e.target.value || null })}
                    className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <input
                    type="date"
                    value={filters.customDateEnd ?? ''}
                    onChange={(e) => onChange({ customDateEnd: e.target.value || null })}
                    className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Views Dropdown */}
        <div className="relative" ref={views.ref}>
          <button
            onClick={() => views.setIsOpen(!views.isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
              hasViewsFilter
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-dark-700 border-dark-600 text-dark-200 hover:border-dark-500'
            }`}
          >
            <span>Views</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {views.isOpen && (
            <div className="absolute top-full mt-1 left-0 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 min-w-[220px] p-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-dark-400">Mínimo</label>
                <input
                  type="number"
                  value={viewsMinInput}
                  onChange={(e) => setViewsMinInput(e.target.value)}
                  onBlur={applyViews}
                  onKeyDown={(e) => e.key === 'Enter' && applyViews()}
                  placeholder="0"
                  className="bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <label className="text-xs text-dark-400">Máximo</label>
                <input
                  type="number"
                  value={viewsMaxInput}
                  onChange={(e) => setViewsMaxInput(e.target.value)}
                  onBlur={applyViews}
                  onKeyDown={(e) => e.key === 'Enter' && applyViews()}
                  placeholder="∞"
                  className="bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                {hasViewsFilter && (
                  <button
                    onClick={() => {
                      setViewsMinInput('');
                      setViewsMaxInput('');
                      onChange({ viewsMin: null, viewsMax: null });
                    }}
                    className="text-xs text-dark-400 hover:text-white mt-1"
                  >
                    Limpar views
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Duracao Dropdown */}
        <div className="relative" ref={duration.ref}>
          <button
            onClick={() => duration.setIsOpen(!duration.isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
              hasDurationFilter
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-dark-700 border-dark-600 text-dark-200 hover:border-dark-500'
            }`}
          >
            <span>Duração</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {duration.isOpen && (
            <div className="absolute top-full mt-1 left-0 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 min-w-[220px] p-3">
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {DURATION_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => {
                      onChange({
                        durationPreset: p.value,
                        durationMin: null,
                        durationMax: null,
                      });
                      setDurationMinInput('');
                      setDurationMaxInput('');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      filters.durationPreset === p.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Manual range */}
              <div className="border-t border-dark-600 pt-2 flex flex-col gap-2">
                <label className="text-xs text-dark-400">Ou manual (segundos)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={durationMinInput}
                    onChange={(e) => setDurationMinInput(e.target.value)}
                    onBlur={applyDuration}
                    onKeyDown={(e) => e.key === 'Enter' && applyDuration()}
                    placeholder="Min"
                    className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={durationMaxInput}
                    onChange={(e) => setDurationMaxInput(e.target.value)}
                    onBlur={applyDuration}
                    onKeyDown={(e) => e.key === 'Enter' && applyDuration()}
                    placeholder="Max"
                    className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ordenar Dropdown */}
        <div className="relative" ref={sort.ref}>
          <button
            onClick={() => sort.setIsOpen(!sort.isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
              hasSortFilter
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-dark-700 border-dark-600 text-dark-200 hover:border-dark-500'
            }`}
          >
            <span>{currentSortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {sort.isOpen && (
            <div className="absolute top-full mt-1 right-0 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 min-w-[180px] py-1">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange({ sortBy: opt.value });
                    sort.setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-dark-700 transition-colors ${
                    filters.sortBy === opt.value ? 'text-blue-400' : 'text-dark-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Limpar */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Contador */}
      <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-2">
        <Filter className="w-4 h-4 text-dark-400" />
        <span className="text-sm text-dark-400">
          {filteredCount === totalCount ? (
            <>{totalCount} videos</>
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
