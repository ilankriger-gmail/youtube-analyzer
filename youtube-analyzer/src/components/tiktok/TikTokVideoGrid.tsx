// ========== COMPONENTE: GRID DE VIDEOS TIKTOK ==========

import { useTikTok } from '../../contexts';
import { TikTokVideoCard } from './TikTokVideoCard';

export function TikTokVideoGrid() {
  const { filteredVideos, isLoading, error } = useTikTok();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-dark-400">
        <div className="w-12 h-12 border-4 border-[#fe2c55] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Carregando videos...</p>
        <p className="text-sm mt-2">Isso pode demorar alguns minutos para perfis grandes</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#fe2c55]">
        <p className="text-lg font-medium mb-2">Erro ao carregar</p>
        <p className="text-dark-400">{error}</p>
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-dark-400">
        <p className="text-lg">Nenhum video encontrado</p>
        <p className="text-sm mt-2">Busque um perfil do TikTok para comecar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredVideos.map((video) => (
        <TikTokVideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
