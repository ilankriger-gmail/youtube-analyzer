// ========== SERVICO DE COMUNICACAO COM API NEON ==========

import type { Video, ChannelInfo } from '../types';
import type { SyncResult, HistoryResponse, MetricsSnapshot } from '../types/database.types';

// Nota: A API usa caminhos relativos que funcionam tanto em dev quanto em prod

// ========== BUSCAR VIDEOS DO BANCO ==========

interface FetchVideosResult {
  videos: Video[];
  channel: ChannelInfo | null;
  lastSync: Date | null;
  totalVideos: number;
}

export async function fetchVideosFromDatabase(channelId?: string): Promise<FetchVideosResult> {
  const url = new URL('/api/videos', window.location.origin);
  if (channelId) {
    url.searchParams.set('channelId', channelId);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar videos do banco');
  }

  const data = await response.json();

  // Converte datas de string para Date
  const videos: Video[] = data.videos.map((v: Video & { publishedAt: string }) => ({
    ...v,
    publishedAt: new Date(v.publishedAt),
  }));

  return {
    videos,
    channel: data.channel,
    lastSync: data.lastSync ? new Date(data.lastSync) : null,
    totalVideos: data.totalVideos,
  };
}

// ========== SINCRONIZAR COM YOUTUBE ==========

export async function syncWithYouTube(handle: string = '@nextleveldj1'): Promise<SyncResult> {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ handle }),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      videosSynced: 0,
      metricsRecorded: 0,
      syncedAt: new Date(),
      error: error.error || 'Erro ao sincronizar',
    };
  }

  const data = await response.json();

  return {
    success: true,
    channelId: data.channelId,
    channelTitle: data.channelTitle,
    videosSynced: data.videosSynced,
    metricsRecorded: data.metricsRecorded,
    syncedAt: new Date(data.syncedAt),
    durationMs: data.durationMs,
  };
}

// ========== BUSCAR HISTORICO DE METRICAS ==========

export async function fetchMetricsHistory(videoId: string, days: number = 30): Promise<HistoryResponse> {
  const url = new URL(`/api/history/${videoId}`, window.location.origin);
  url.searchParams.set('days', days.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar historico');
  }

  const data = await response.json();

  // Converte datas
  const history: MetricsSnapshot[] = data.history.map((h: MetricsSnapshot & { recordedAt: string }) => ({
    ...h,
    recordedAt: new Date(h.recordedAt),
  }));

  return {
    videoId: data.videoId,
    history,
    latest: data.latest
      ? {
          ...data.latest,
          recordedAt: new Date(data.latest.recordedAt),
        }
      : null,
    growth: data.growth,
  };
}

// ========== VERIFICAR SAUDE DO BANCO ==========

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/videos');
    return response.ok;
  } catch {
    return false;
  }
}
