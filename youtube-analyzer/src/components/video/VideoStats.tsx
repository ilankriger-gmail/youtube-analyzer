// ========== SECAO: COMPONENTE VIDEO STATS ==========

import { Eye, Calendar, ThumbsUp, MessageCircle, TrendingUp } from 'lucide-react';
import { formatViewsCompact } from '../../utils/number.utils';
import { formatDateCompact } from '../../utils/date.utils';
import type { Video } from '../../types';

interface VideoStatsProps {
  video: Video;
  variant?: 'inline' | 'stacked' | 'detailed';
  showIcons?: boolean;
  showRatios?: boolean;
  className?: string;
}

/**
 * Calcula ratio como "1:X" (1 like/comment a cada X views)
 */
function formatRatio(views: number, count: number): string {
  if (count === 0) return '-';
  const ratio = Math.round(views / count);
  return `1:${ratio.toLocaleString('pt-BR')}`;
}

export function VideoStats({
  video,
  variant = 'inline',
  showIcons = true,
  showRatios = false,
  className = '',
}: VideoStatsProps) {
  const viewsText = formatViewsCompact(video.viewCount);
  const likesText = formatViewsCompact(video.likeCount);
  const commentsText = formatViewsCompact(video.commentCount);
  const dateText = formatDateCompact(video.publishedAt);

  // Ratios
  const likesRatio = formatRatio(video.viewCount, video.likeCount);
  const commentsRatio = formatRatio(video.viewCount, video.commentCount);

  if (variant === 'detailed') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Linha 1: Views, Likes, Comments */}
        <div className="flex items-center gap-4 text-sm text-dark-400">
          <div className="flex items-center gap-1">
            {showIcons && <Eye className="w-3.5 h-3.5" />}
            <span>{viewsText}</span>
          </div>
          <div className="flex items-center gap-1">
            {showIcons && <ThumbsUp className="w-3.5 h-3.5" />}
            <span>{likesText}</span>
          </div>
          <div className="flex items-center gap-1">
            {showIcons && <MessageCircle className="w-3.5 h-3.5" />}
            <span>{commentsText}</span>
          </div>
        </div>

        {/* Linha 2: Ratios */}
        {showRatios && (
          <div className="flex items-center gap-3 text-xs text-dark-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Like {likesRatio}</span>
            </div>
            <span className="text-dark-600">•</span>
            <div className="flex items-center gap-1">
              <span>Comment {commentsRatio}</span>
            </div>
          </div>
        )}

        {/* Linha 3: Data */}
        <div className="flex items-center gap-1.5 text-xs text-dark-500">
          {showIcons && <Calendar className="w-3 h-3" />}
          <span>{dateText}</span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-3 text-sm text-dark-400">
          <div className="flex items-center gap-1">
            {showIcons && <Eye className="w-3.5 h-3.5" />}
            <span>{viewsText}</span>
          </div>
          <div className="flex items-center gap-1">
            {showIcons && <ThumbsUp className="w-3.5 h-3.5" />}
            <span>{likesText}</span>
          </div>
          <div className="flex items-center gap-1">
            {showIcons && <MessageCircle className="w-3.5 h-3.5" />}
            <span>{commentsText}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-dark-500">
          {showIcons && <Calendar className="w-3 h-3" />}
          <span>{dateText}</span>
        </div>
      </div>
    );
  }

  // Inline (default) - compacto para cards
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-dark-400">
        <div className="flex items-center gap-1">
          {showIcons && <Eye className="w-3 h-3" />}
          <span>{viewsText}</span>
        </div>
        <span className="text-dark-600">•</span>
        <div className="flex items-center gap-1">
          {showIcons && <ThumbsUp className="w-3 h-3" />}
          <span>{likesText}</span>
        </div>
        <span className="text-dark-600">•</span>
        <div className="flex items-center gap-1">
          {showIcons && <MessageCircle className="w-3 h-3" />}
          <span>{commentsText}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-dark-500">
        {showIcons && <Calendar className="w-3 h-3" />}
        <span>{dateText}</span>
      </div>
    </div>
  );
}
