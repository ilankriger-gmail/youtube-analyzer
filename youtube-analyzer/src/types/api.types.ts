// ========== SECAO: TIPOS DA API DO YOUTUBE ==========

/**
 * Thumbnails retornadas pela API do YouTube
 */
export interface YouTubeThumbnails {
  default: { url: string; width: number; height: number };
  medium: { url: string; width: number; height: number };
  high: { url: string; width: number; height: number };
  standard?: { url: string; width: number; height: number };
  maxres?: { url: string; width: number; height: number };
}

/**
 * Resposta da API para informacoes do canal
 */
export interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: YouTubeThumbnails;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
    };
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

/**
 * Resposta da API para itens de playlist
 */
export interface YouTubePlaylistItemsResponse {
  items: Array<{
    contentDetails: {
      videoId: string;
    };
  }>;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

/**
 * Resposta da API para detalhes dos videos
 */
export interface YouTubeVideosResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: YouTubeThumbnails;
      channelId: string;
      channelTitle: string;
    };
    contentDetails: {
      duration: string; // Formato ISO 8601: "PT3M45S"
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }>;
}

// ========== SECAO: TIPOS DA API COBALT ==========

/**
 * Requisicao para a API Cobalt
 */
export interface CobaltRequest {
  url: string;
  videoQuality?: '1080' | '720' | '480' | '360';
  audioFormat?: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus';
  filenameStyle?: 'classic' | 'pretty' | 'basic' | 'nerdy';
  downloadMode?: 'auto' | 'audio' | 'mute';
  youtubeVideoCodec?: 'h264' | 'av1' | 'vp9';
}

/**
 * Resposta de sucesso da API Cobalt
 */
export interface CobaltSuccessResponse {
  status: 'redirect' | 'tunnel';
  url: string;
  filename: string;
}

/**
 * Resposta com opcoes da API Cobalt
 */
export interface CobaltPickerResponse {
  status: 'picker';
  audio?: string;
  picker: Array<{
    type: 'video' | 'photo' | 'gif';
    url: string;
    thumb?: string;
  }>;
}

/**
 * Resposta de erro da API Cobalt
 */
export interface CobaltErrorResponse {
  status: 'error';
  error: {
    code: string;
    context?: {
      service?: string;
      limit?: number;
    };
  };
}

/**
 * Todas as respostas possiveis da API Cobalt
 */
export type CobaltResponse =
  | CobaltSuccessResponse
  | CobaltPickerResponse
  | CobaltErrorResponse;
