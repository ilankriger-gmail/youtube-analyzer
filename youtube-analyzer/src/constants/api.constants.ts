// ========== SECAO: CONSTANTES DA API ==========

/**
 * URL base da API do YouTube
 */
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * URL do backend de download (yt-dlp)
 * Em producao usa variavel de ambiente, em dev usa localhost
 */
export const DOWNLOAD_API_URL = import.meta.env.VITE_DOWNLOAD_API_URL || 'http://localhost:3001';

/**
 * Endpoints da API do YouTube
 */
export const YOUTUBE_ENDPOINTS = {
  CHANNELS: '/channels',
  PLAYLIST_ITEMS: '/playlistItems',
  VIDEOS: '/videos',
} as const;

/**
 * Handle do canal fixo (pode ser alterado para outros canais no futuro)
 */
export const CHANNEL_HANDLE = '@nextleveldj1';

/**
 * URL base da API Cobalt para downloads (mantido para compatibilidade)
 */
export const COBALT_API_URL = 'https://cobalt-api.kwiatekmiki.com';

/**
 * Lista de instancias Cobalt com CORS habilitado para uso no browser
 * Fonte: https://instances.cobalt.best/
 * Se uma falhar, tenta a proxima automaticamente
 */
export const COBALT_INSTANCES = [
  'https://cobalt-api.kwiatekmiki.com',
  'https://cobalt-7.kwiatekmiki.com',
  'https://capi.3kh0.net',
  'https://downloadapi.stuff.solutions',
  'https://cobalt-backend.canine.tools',
];

/**
 * Configuracoes de paginacao da API
 */
export const API_CONFIG = {
  /** Maximo de itens por pagina na API do YouTube */
  MAX_RESULTS_PER_PAGE: 50,
  /** Maximo de videos a buscar do canal (aumentado para pegar todos) */
  MAX_VIDEOS_TO_FETCH: 5000,
  /** Tempo de cache em milissegundos (30 minutos) */
  CACHE_DURATION_MS: 30 * 60 * 1000,
} as const;

/**
 * Chaves para localStorage
 */
export const STORAGE_KEYS = {
  VIDEOS_CACHE: 'yt_analyzer_videos',
  CHANNEL_CACHE: 'yt_analyzer_channel',
  CACHE_TIMESTAMP: 'yt_analyzer_cache_timestamp',
} as const;
