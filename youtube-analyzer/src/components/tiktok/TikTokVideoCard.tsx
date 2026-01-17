// ========== COMPONENTE: CARD DE VIDEO TIKTOK ==========

import { Eye, Clock, Calendar, Download } from 'lucide-react';
import { useTikTok } from '../../contexts';
import {
  formatViews,
  formatDuration,
  formatTikTokDate,
  downloadTikTokSimple,
  type TikTokVideo,
} from '../../services/tiktok.service';

interface TikTokVideoCardProps {
  video: TikTokVideo;
}

export function TikTokVideoCard({ video }: TikTokVideoCardProps) {
  const { selectedIds, toggleSelection, top5Ids, bottom5Ids, quality } = useTikTok();

  const isSelected = selectedIds.has(video.id);
  const isTop5 = top5Ids.has(video.id);
  const isBottom5 = bottom5Ids.has(video.id);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadTikTokSimple(video.url, quality, video.title, video.views);
    } catch (error) {
      console.error('Erro no download:', error);
    }
  };

  return (
    <div
      onClick={() => toggleSelection(video.id)}
      className={`
        relative bg-dark-800 rounded-lg overflow-hidden cursor-pointer transition-all
        hover:ring-2 hover:ring-[#fe2c55]/50
        ${isSelected ? 'ring-2 ring-[#fe2c55]' : ''}
        ${isTop5 ? 'border-l-4 border-[#25f4ee]' : ''}
        ${isBottom5 ? 'border-l-4 border-[#fe2c55]' : ''}
      `}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {isTop5 && (
          <span className="px-2 py-0.5 bg-[#25f4ee] text-black text-xs font-bold rounded">
            TOP 5
          </span>
        )}
        {isBottom5 && (
          <span className="px-2 py-0.5 bg-[#fe2c55] text-white text-xs font-bold rounded">
            BOTTOM 5
          </span>
        )}
      </div>

      {/* Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelection(video.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-2 border-dark-500 bg-dark-700 checked:bg-[#fe2c55] checked:border-[#fe2c55] cursor-pointer accent-[#fe2c55]"
        />
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-dark-700">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23666" dy=".3em">TikTok</text></svg>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dark-500">
            <span>Sem thumbnail</span>
          </div>
        )}

        {/* Duracao overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white text-sm font-medium line-clamp-2 mb-2" title={video.title}>
          {video.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </span>
          {video.uploadDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatTikTokDate(video.uploadDate)}
            </span>
          )}
        </div>

        {/* Botao download individual */}
        <button
          onClick={handleDownload}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
