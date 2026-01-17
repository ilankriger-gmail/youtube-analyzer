// ========== TIPOS PARA BANCO DE DADOS ==========

// Snapshot de metricas em um ponto no tempo
export interface MetricsSnapshot {
  recordedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

// Resultado da sincronizacao
export interface SyncResult {
  success: boolean;
  channelId?: string;
  channelTitle?: string;
  videosSynced: number;
  metricsRecorded: number;
  syncedAt: Date;
  durationMs?: number;
  error?: string;
}

// Estado da sincronizacao
export interface SyncState {
  isSyncing: boolean;
  lastSync: Date | null;
  lastSyncResult: SyncResult | null;
  error: string | null;
}

// Crescimento de metricas
export interface MetricsGrowth {
  views: {
    absolute: number;
    percentage: number;
  };
  likes: {
    absolute: number;
    percentage: number;
  };
  comments: {
    absolute: number;
    percentage: number;
  };
  periodDays: number;
  dataPoints: number;
}

// Resposta do endpoint de historico
export interface HistoryResponse {
  videoId: string;
  history: MetricsSnapshot[];
  latest: MetricsSnapshot | null;
  growth: MetricsGrowth | null;
}

// Resposta do endpoint de videos
export interface VideosResponse {
  videos: import('./video.types').Video[];
  channel: import('./video.types').ChannelInfo | null;
  lastSync: Date | null;
  totalVideos: number;
  source: 'database' | 'cache' | 'api';
}

// Fonte dos dados
export type DataSource = 'database' | 'cache' | 'api';
