// ========== SECAO: TIPOS DE VIDEO ==========

/**
 * Representa um video do YouTube com todas as informacoes necessarias
 */
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailMediumUrl: string;
  thumbnailHighUrl: string;
  publishedAt: Date;
  duration: number;          // em segundos
  durationFormatted: string; // "3:45" ou "1:23:45"
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isShort: boolean;          // duration < 60 segundos
  channelId: string;
  channelTitle: string;
}

/**
 * Informacoes do canal do YouTube
 */
export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  uploadsPlaylistId: string;
}

/**
 * Tipo de video para filtragem
 */
export type VideoType = 'short' | 'long' | 'all';
