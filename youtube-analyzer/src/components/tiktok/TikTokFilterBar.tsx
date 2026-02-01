// ========== COMPONENTE: BARRA DE FILTROS TIKTOK ==========

import { useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useTikTok } from '../../contexts';
import { parseDuration } from '../../services/tiktok.service';

export function TikTokFilterBar() {
  const { filters, setFilters, resetFilters, filteredVideos, videos } = useTikTok();

  const [minViewsInput, setMinViewsInput] = useState('');
  const [maxViewsInput, setMaxViewsInput] = useState('');
  const [minDurationInput, setMinDurationInput] = useState('');
  const [maxDurationInput, setMaxDurationInput] = useState('');

  const handleApplyFilters = () => {
    setFilters({
      minViews: minViewsInput ? parseInt(minViewsInput) : null,
      maxViews: maxViewsInput ? parseInt(maxViewsInput) : null,
      minDuration: minDurationInput ? parseDuration(minDurationInput) : null,
      maxDuration: maxDurationInput ? parseDuration(maxDurationInput) : null,
    });
  };

  const handleReset = () => {
    setMinViewsInput('');
    setMaxViewsInput('');
    setMinDurationInput('');
    setMaxDurationInput('');
    resetFilters();
  };

  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-[#25f4ee]" />
        <span className="text-white font-medium">Filtros</span>
        <span className="text-dark-400 text-sm ml-auto">
          {filteredVideos.length === videos.length
            ? `${videos.length} videos`
            : `${filteredVideos.length} de ${videos.length} videos`}
        </span>
      </div>

      {/* Busca por texto e Periodo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Busca por texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters({ searchText: e.target.value })}
            placeholder="Buscar por titulo..."
            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 pl-10 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
          />
        </div>

        {/* Periodo */}
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters({ dateRange: e.target.value as typeof filters.dateRange })}
          className="bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
        >
          <option value="all">Todo periodo</option>
          <option value="7">Ultimos 7 dias</option>
          <option value="30">Ultimos 30 dias</option>
          <option value="60">Ultimos 60 dias</option>
          <option value="90">Ultimos 90 dias</option>
          <option value="365">Ultimo ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Views */}
        <div className="flex gap-2">
          <input
            type="number"
            value={minViewsInput}
            onChange={(e) => setMinViewsInput(e.target.value)}
            placeholder="Views min"
            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
          />
          <input
            type="number"
            value={maxViewsInput}
            onChange={(e) => setMaxViewsInput(e.target.value)}
            placeholder="Views max"
            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
          />
        </div>

        {/* Duracao */}
        <div className="flex gap-2">
          <input
            type="text"
            value={minDurationInput}
            onChange={(e) => setMinDurationInput(e.target.value)}
            placeholder="Dur. min (mm:ss)"
            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
          />
          <input
            type="text"
            value={maxDurationInput}
            onChange={(e) => setMaxDurationInput(e.target.value)}
            placeholder="Dur. max (mm:ss)"
            className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
          />
        </div>

        {/* Ordenacao */}
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value as typeof filters.sortBy })}
          className="bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fe2c55]"
        >
          <option value="views-desc">Mais Views</option>
          <option value="views-asc">Menos Views</option>
          <option value="date-desc">Mais Recente</option>
          <option value="date-asc">Mais Antigo</option>
          <option value="duration-desc">Maior Duracao</option>
          <option value="duration-asc">Menor Duracao</option>
        </select>

        {/* Botoes */}
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-[#fe2c55] text-white rounded hover:bg-[#fe2c55]/80 transition-colors text-sm font-medium"
        >
          Aplicar
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar
        </button>
      </div>
    </div>
  );
}
