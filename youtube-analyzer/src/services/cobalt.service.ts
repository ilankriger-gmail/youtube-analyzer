// ========== SECAO: SERVICO DE DOWNLOAD (YT-DLP BACKEND) ==========

import type { CobaltSuccessResponse } from '../types';
import { DOWNLOAD_API_URL } from '../constants';

/**
 * Opcoes de configuracao para o download
 */
interface DownloadConfig {
  quality?: 'best' | '1080' | '720' | '480' | '360';
  format?: 'mp4' | 'webm';
}

/**
 * Obtem URL de download do video via backend local yt-dlp
 * Mantem mesma interface do Cobalt para compatibilidade
 */
export async function getDownloadUrl(
  videoId: string,
  config: DownloadConfig = {}
): Promise<CobaltSuccessResponse> {
  const { quality = 'best' } = config;

  // Constroi URL do endpoint de download
  const downloadUrl = `${DOWNLOAD_API_URL}/api/download?videoId=${videoId}&quality=${quality}`;

  // Retorna no mesmo formato que o Cobalt retornava
  return {
    status: 'redirect',
    url: downloadUrl,
    filename: `video_${videoId}.mp4`,
  };
}

/**
 * Faz download do arquivo com nome customizado e tracking de progresso
 */
export async function downloadWithProgress(
  downloadUrl: string,
  filename: string,
  onProgress: (progress: number) => void
): Promise<void> {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Erro no download: ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    throw new Error('Response body nao disponivel');
  }

  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value.buffer);
    received += value.length;

    if (total > 0) {
      onProgress(Math.round((received / total) * 100));
    } else {
      // Se nao temos content-length, simula progresso
      onProgress(Math.min(95, Math.round(received / 1000000))); // 1% por MB
    }
  }

  // Cria blob e faz download
  const blob = new Blob(chunks, { type: 'video/mp4' });
  triggerDownload(blob, filename);
}

/**
 * Download simples sem tracking de progresso
 */
export async function downloadSimple(
  downloadUrl: string,
  filename: string
): Promise<void> {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Erro no download: ${response.status}`);
  }

  const blob = await response.blob();
  triggerDownload(blob, filename);
}

/**
 * Dispara o download no browser
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpa a URL do blob apos um delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Verifica se o backend de download esta disponivel
 */
export async function checkCobaltAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${DOWNLOAD_API_URL}/api/check`);
    if (response.ok) {
      const data = await response.json();
      return data.ready === true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Gera URL do YouTube para copia manual (fallback)
 */
export function getYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Gera URL curta do YouTube
 */
export function getYouTubeShortUrl(videoId: string): string {
  return `https://youtu.be/${videoId}`;
}
