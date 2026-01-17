// ========== SERVICO TIKTOK ==========

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlink, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import type { ReadStream } from 'fs';
import { neon } from '@neondatabase/serverless';

// ========== PERFIL FIXO ==========
export const TIKTOK_FIXED_USERNAME = 'nextleveldj';

// ========== DATABASE ==========
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';

// ========== TIPOS ==========

export interface TikTokVideo {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: number;
  views: number;
  thumbnail: string;
  uploadDate: string;
  platform: 'tiktok';
}

export interface TikTokProfileResult {
  success: boolean;
  profile: {
    username: string;
    videoCount: number;
  };
  videos: TikTokVideo[];
}

export interface TikTokVideoInfo {
  valid: boolean;
  url: string;
  platform: 'tiktok';
  title: string;
  duration: number;
  thumbnail: string;
  channel: string;
  views: number;
  error?: string;
}

export type VideoQuality = 'best' | '1080' | '720' | '480' | '360' | 'audio';

// ========== FORMATOS DE QUALIDADE ==========

const QUALITY_FORMATS: Record<VideoQuality, string> = {
  'best': 'bestvideo+bestaudio/best',
  '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
  '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
  '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
  '360': 'bestvideo[height<=360]+bestaudio/best[height<=360]',
  'audio': 'bestaudio',
};

// ========== VALIDACAO DE URL ==========

const TIKTOK_PATTERNS = [
  /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,  // URL completa
  /^(https?:\/\/)?(www\.)?tiktok\.com\/t\/[\w]+/,              // Link curto /t/
  /^(https?:\/\/)?vm\.tiktok\.com\/[\w]+/,                     // Link curto vm.tiktok
  /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+/               // Perfil
];

export function isValidTikTokUrl(url: string): boolean {
  return TIKTOK_PATTERNS.some(pattern => pattern.test(url));
}

export function isProfileUrl(url: string): boolean {
  // Perfil nao tem /video/ no caminho
  return /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/?$/.test(url);
}

// ========== OBTER INFO DO VIDEO ==========

export async function getTikTokVideoInfo(url: string): Promise<TikTokVideoInfo> {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-download',
      '--no-warnings',
      url,
    ];

    const ytdlp = spawn('yt-dlp', args);
    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        resolve({
          valid: false,
          url,
          platform: 'tiktok',
          title: '',
          duration: 0,
          thumbnail: '',
          channel: '',
          views: 0,
          error: stderr || `Falha ao obter informacoes`,
        });
        return;
      }

      try {
        const info = JSON.parse(stdout);
        resolve({
          valid: true,
          url: url,
          platform: 'tiktok',
          title: info.title || info.description?.substring(0, 100) || 'TikTok Video',
          duration: info.duration || 0,
          thumbnail: info.thumbnail || '',
          channel: info.channel || info.uploader || info.creator || 'Unknown',
          views: info.view_count || info.play_count || 0,
        });
      } catch {
        resolve({
          valid: false,
          url,
          platform: 'tiktok',
          title: '',
          duration: 0,
          thumbnail: '',
          channel: '',
          views: 0,
          error: 'Erro ao parsear resposta',
        });
      }
    });

    ytdlp.on('error', (err) => {
      reject(err);
    });
  });
}

// ========== BUSCAR PERFIL ==========

export async function getTikTokProfile(username: string, limit: number = 100): Promise<TikTokProfileResult> {
  return new Promise((resolve, reject) => {
    // Remove @ se existir
    const cleanUsername = username.replace('@', '');
    const profileUrl = `https://www.tiktok.com/@${cleanUsername}`;

    console.log(`[TIKTOK] Buscando videos de @${cleanUsername} (limite: ${limit})`);

    const args = [
      '--dump-json',
      '--flat-playlist',
      '--no-download',
      '--no-warnings',
      '--ignore-errors',
      '--playlist-end', String(limit),
      profileUrl,
    ];

    const ytdlp = spawn('yt-dlp', args);

    let stdout = '';
    let stderr = '';

    // Timeout de 5 minutos
    const timeout = setTimeout(() => {
      ytdlp.kill('SIGTERM');
      reject(new Error('Timeout ao buscar perfil (5 minutos)'));
    }, 300000);

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      clearTimeout(timeout);

      // Verifica se e conta privada ou indisponivel
      if (code !== 0 && stdout.length === 0) {
        if (stderr.includes('private') || stderr.includes('unavailable')) {
          reject(new Error('Conta privada ou indisponivel'));
        } else {
          reject(new Error(stderr || 'Falha ao buscar perfil'));
        }
        return;
      }

      try {
        // yt-dlp retorna um JSON por linha
        const lines = stdout.trim().split('\n').filter(line => line.trim());
        const videos: TikTokVideo[] = [];

        for (const line of lines) {
          try {
            const info = JSON.parse(line);
            videos.push({
              id: info.id,
              url: info.webpage_url || info.url || `https://www.tiktok.com/@${cleanUsername}/video/${info.id}`,
              title: info.title || info.description?.substring(0, 100) || 'TikTok Video',
              channel: info.channel || info.uploader || cleanUsername,
              duration: info.duration || 0,
              views: info.view_count || info.play_count || 0,
              thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
              uploadDate: info.upload_date || '',
              platform: 'tiktok',
            });
          } catch {
            // Pula linhas invalidas
            continue;
          }
        }

        console.log(`[TIKTOK] Encontrados ${videos.length} videos de @${cleanUsername}`);

        resolve({
          success: true,
          profile: {
            username: cleanUsername,
            videoCount: videos.length,
          },
          videos: videos,
        });

      } catch {
        reject(new Error('Falha ao processar resposta do TikTok'));
      }
    });

    ytdlp.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ========== DOWNLOAD ==========

export interface DownloadOptions {
  quality: VideoQuality;
  filename?: string;
}

export interface DownloadResult {
  tempFilePath: string;
  fileSize: number;
  cleanup: () => Promise<void>;
  createStream: () => ReadStream;
}

export async function downloadTikTokVideo(
  url: string,
  options: DownloadOptions,
  onProgress?: (progress: string) => void
): Promise<DownloadResult> {
  const format = QUALITY_FORMATS[options.quality] || QUALITY_FORMATS['best'];
  const isAudioOnly = options.quality === 'audio';
  const ext = isAudioOnly ? 'mp3' : 'mp4';

  // Criar arquivo temporario unico
  const tempFileName = `tiktok_${randomUUID()}.${ext}`;
  const tempFilePath = join(tmpdir(), tempFileName);

  const args = [
    '-f', format,
    '--no-warnings',
  ];

  if (isAudioOnly) {
    args.push('--extract-audio');
    args.push('--audio-format', 'mp3');
    args.push('--audio-quality', '0');
  } else {
    args.push('--merge-output-format', 'mp4');
  }

  args.push('--newline');
  args.push('-o', tempFilePath);
  args.push(url);

  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', args);
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      const line = data.toString().trim();
      if (line && onProgress) {
        const progressMatch = line.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
          onProgress(progressMatch[1]);
        }
      }
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
      const line = data.toString().trim();
      if (line && onProgress) {
        const progressMatch = line.match(/(\d+\.?\d*)%/);
        if (progressMatch) {
          onProgress(progressMatch[1]);
        }
      }
    });

    ytdlp.on('close', async (code) => {
      if (code !== 0) {
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignorar
        }
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        return;
      }

      try {
        const fileStats = await stat(tempFilePath);

        resolve({
          tempFilePath,
          fileSize: fileStats.size,
          cleanup: async () => {
            try {
              await unlink(tempFilePath);
            } catch {
              // Ignorar
            }
          },
          createStream: () => createReadStream(tempFilePath),
        });
      } catch {
        reject(new Error('Download completou mas arquivo nao encontrado'));
      }
    });

    ytdlp.on('error', (error) => {
      reject(error);
    });
  });
}

// ========== DATABASE FUNCTIONS ==========

/**
 * Busca videos do banco de dados
 */
export async function fetchTikTokVideosFromDB(): Promise<TikTokVideo[]> {
  if (!DATABASE_URL) {
    console.log('[TIKTOK DB] DATABASE_URL nao configurada');
    return [];
  }

  try {
    const sql = neon(DATABASE_URL);
    const rows = await sql`
      SELECT id, url, title, channel, duration, views, thumbnail, upload_date
      FROM tiktok_videos
      ORDER BY views DESC
    `;

    return rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      url: row.url as string,
      title: row.title as string || '',
      channel: row.channel as string || TIKTOK_FIXED_USERNAME,
      duration: row.duration as number || 0,
      views: row.views as number || 0,
      thumbnail: row.thumbnail as string || '',
      uploadDate: row.upload_date as string || '',
      platform: 'tiktok' as const,
    }));
  } catch (error) {
    console.error('[TIKTOK DB] Erro ao buscar videos:', error);
    return [];
  }
}

/**
 * Salva videos no banco de dados (upsert)
 */
export async function saveTikTokVideosToDB(videos: TikTokVideo[]): Promise<number> {
  if (!DATABASE_URL) {
    console.log('[TIKTOK DB] DATABASE_URL nao configurada');
    return 0;
  }

  if (videos.length === 0) return 0;

  try {
    const sql = neon(DATABASE_URL);
    let savedCount = 0;

    for (const video of videos) {
      await sql`
        INSERT INTO tiktok_videos (id, url, title, channel, duration, views, thumbnail, upload_date, updated_at)
        VALUES (${video.id}, ${video.url}, ${video.title}, ${video.channel}, ${video.duration}, ${video.views}, ${video.thumbnail}, ${video.uploadDate}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          views = EXCLUDED.views,
          thumbnail = EXCLUDED.thumbnail,
          updated_at = NOW()
      `;
      savedCount++;
    }

    console.log(`[TIKTOK DB] Salvos ${savedCount} videos`);
    return savedCount;
  } catch (error) {
    console.error('[TIKTOK DB] Erro ao salvar videos:', error);
    throw error;
  }
}

/**
 * Sincroniza videos do TikTok com o banco de dados
 * Busca do perfil fixo e salva no banco
 */
export async function syncTikTokWithDatabase(limit: number = 2000): Promise<{
  success: boolean;
  videosCount: number;
  videos: TikTokVideo[];
  error?: string;
}> {
  console.log(`[TIKTOK SYNC] Iniciando sincronizacao de @${TIKTOK_FIXED_USERNAME}`);

  try {
    // 1. Buscar videos do TikTok via yt-dlp
    const result = await getTikTokProfile(TIKTOK_FIXED_USERNAME, limit);

    if (!result.success || result.videos.length === 0) {
      return {
        success: false,
        videosCount: 0,
        videos: [],
        error: 'Nenhum video encontrado no perfil',
      };
    }

    // 2. Salvar no banco de dados
    await saveTikTokVideosToDB(result.videos);

    console.log(`[TIKTOK SYNC] Sincronizados ${result.videos.length} videos`);

    return {
      success: true,
      videosCount: result.videos.length,
      videos: result.videos,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[TIKTOK SYNC] Erro:', errorMessage);
    return {
      success: false,
      videosCount: 0,
      videos: [],
      error: errorMessage,
    };
  }
}

// ========== HELPERS ==========

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
