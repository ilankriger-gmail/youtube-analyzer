// ========== SECAO: TIPOS DE DOWNLOAD ==========

import type { Video } from './video.types';

/**
 * Status do download de um video
 */
export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Item na fila de download
 */
export interface DownloadQueueItem {
  videoId: string;
  video: Video;
  status: DownloadStatus;
  progress: number;       // 0-100
  error?: string;
  filename: string;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Opcoes de download
 */
export interface DownloadOptions {
  quality: VideoQuality;
  format: 'mp4' | 'webm';
}

/**
 * Qualidade do video para download
 */
export type VideoQuality = '1080' | '720' | '480' | '360';
