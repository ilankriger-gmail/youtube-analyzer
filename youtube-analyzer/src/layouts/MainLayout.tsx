// ========== SECAO: COMPONENTE MAIN LAYOUT ==========

import { useState } from 'react';
import { Header } from './Header';
import { FilterBar } from '../components/filters';
import { SelectionBar, DownloadModal } from '../components/download';
import { VideoGrid, VideoList, ViewToggle, EmptyState, type ViewMode } from '../components/video';
import { LoadingSpinner } from '../components/ui';
import { useVideos, useFilters } from '../hooks';
import { UI_TEXT } from '../constants';

export function MainLayout() {
  const { isLoading, error, refreshVideos } = useVideos();
  const { filteredVideos, totalCount, clearFilters, hasActiveFilters } = useFilters();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Estado de carregamento
  if (isLoading && totalCount === 0) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner text={UI_TEXT.loading.videos} size="lg" className="py-20" />
        </main>
      </div>
    );
  }

  // Estado de erro
  if (error && totalCount === 0) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
          <EmptyState type="error" onRetry={refreshVideos} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Barra de filtros */}
        <FilterBar className="mb-6" />

        {/* Barra de selecao */}
        <SelectionBar className="mb-6" />

        {/* Toggle de visualizacao + resultados */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-dark-100">
              Videos
            </h2>
            <span className="text-sm text-dark-400">
              {filteredVideos.length === totalCount
                ? `${totalCount} vídeos`
                : `${filteredVideos.length} de ${totalCount} vídeos`}
            </span>
          </div>
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>

        {/* Lista de videos */}
        {filteredVideos.length === 0 ? (
          <EmptyState
            type={hasActiveFilters ? 'no-results' : 'no-videos'}
            onRetry={refreshVideos}
            onClearFilters={clearFilters}
          />
        ) : viewMode === 'grid' ? (
          <VideoGrid videos={filteredVideos} />
        ) : (
          <VideoList videos={filteredVideos} />
        )}

        {/* Loading overlay durante refresh */}
        {isLoading && totalCount > 0 && (
          <div className="fixed bottom-4 right-4 bg-dark-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-dark-300">Atualizando...</span>
          </div>
        )}
      </main>

      {/* Modal de download */}
      <DownloadModal />
    </div>
  );
}
