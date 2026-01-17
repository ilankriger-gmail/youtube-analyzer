// ========== SERVICO YT-DLP ==========

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlink, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import type { ReadStream } from 'fs';

const execAsync = promisify(exec);

// ========== TIPOS ==========

export interface ToolStatus {
  installed: boolean;
  version: string | null;
}

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  channel: string;
  viewCount: number;
  formats: string[];
}

export type VideoQuality = 'best' | '1080' | '720' | '480' | '360';

// ========== FORMATOS DE QUALIDADE ==========

const QUALITY_FORMATS: Record<VideoQuality, string> = {
  'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
  '1080': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]',
  '720': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
  '480': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]',
  '360': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]',
};

// ========== VERIFICAR INSTALACAO ==========

export async function checkYtdlp(): Promise<ToolStatus> {
  try {
    const { stdout } = await execAsync('yt-dlp --version');
    return {
      installed: true,
      version: stdout.trim(),
    };
  } catch {
    return {
      installed: false,
      version: null,
    };
  }
}

export async function checkFfmpeg(): Promise<ToolStatus> {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    const match = stdout.match(/ffmpeg version (\S+)/);
    return {
      installed: true,
      version: match ? match[1] : 'unknown',
    };
  } catch {
    return {
      installed: false,
      version: null,
    };
  }
}

// ========== OBTER INFO DO VIDEO ==========

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--no-playlist',
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
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        return;
      }

      try {
        const info = JSON.parse(stdout);

        // Extrair qualidades disponíveis
        const heights = new Set<number>();
        if (info.formats) {
          for (const format of info.formats) {
            if (format.height && format.vcodec !== 'none') {
              heights.add(format.height);
            }
          }
        }

        const availableFormats: string[] = [];
        if (heights.has(1080) || Math.max(...heights) >= 1080) availableFormats.push('1080');
        if (heights.has(720) || Math.max(...heights) >= 720) availableFormats.push('720');
        if (heights.has(480) || Math.max(...heights) >= 480) availableFormats.push('480');
        if (heights.has(360) || Math.max(...heights) >= 360) availableFormats.push('360');

        resolve({
          id: info.id,
          title: info.title,
          duration: info.duration || 0,
          thumbnail: info.thumbnail,
          channel: info.uploader || info.channel || '',
          viewCount: info.view_count || 0,
          formats: availableFormats.length > 0 ? availableFormats : ['720'],
        });
      } catch (parseError) {
        reject(new Error('Failed to parse video info'));
      }
    });

    ytdlp.on('error', (error) => {
      reject(error);
    });
  });
}

// ========== DOWNLOAD VIDEO ==========

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

/**
 * Baixa video para arquivo temporario (necessario para merge video+audio)
 * Retorna o caminho do arquivo, tamanho e funcao de cleanup
 */
export async function downloadVideoToFile(
  url: string,
  options: DownloadOptions,
  onProgress?: (progress: string) => void
): Promise<DownloadResult> {
  const format = QUALITY_FORMATS[options.quality] || QUALITY_FORMATS['720'];

  // Criar arquivo temporario unico
  const tempFileName = `ytdl_${randomUUID()}.mp4`;
  const tempFilePath = join(tmpdir(), tempFileName);

  const args = [
    '-f', format,
    '--no-warnings',
    '--no-playlist',
    '--merge-output-format', 'mp4',
    '--newline', // Para progresso linha por linha
    '-o', tempFilePath,
    url,
  ];

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
      // Progresso tambem pode vir no stderr
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
        // Limpar arquivo parcial se existir
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignorar erro se arquivo nao existe
        }
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        return;
      }

      try {
        // Verificar se arquivo existe e obter tamanho
        const fileStats = await stat(tempFilePath);

        resolve({
          tempFilePath,
          fileSize: fileStats.size,
          cleanup: async () => {
            try {
              await unlink(tempFilePath);
            } catch {
              // Ignorar erro de cleanup
            }
          },
          createStream: () => createReadStream(tempFilePath),
        });
      } catch (error) {
        reject(new Error('Download completou mas arquivo nao encontrado'));
      }
    });

    ytdlp.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * @deprecated Use downloadVideoToFile para downloads que requerem merge
 */
export function downloadVideo(
  url: string,
  options: DownloadOptions
): { process: ReturnType<typeof spawn>; args: string[] } {
  const format = QUALITY_FORMATS[options.quality] || QUALITY_FORMATS['720'];

  const args = [
    '-f', format,
    '--no-warnings',
    '--no-playlist',
    '--merge-output-format', 'mp4',
    '-o', '-', // Output para stdout
    url,
  ];

  const ytdlp = spawn('yt-dlp', args);

  return { process: ytdlp, args };
}

// ========== CONSTRUIR URL DO YOUTUBE ==========

export function buildYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// ========== VALIDAR URL ==========

export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^(https?:\/\/)?youtu\.be\/[\w-]+/,
  ];
  return patterns.some((p) => p.test(url));
}

// ========== EXTRAIR VIDEO ID ==========

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
