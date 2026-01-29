// ========== SECAO: SERVICO DE DOWNLOAD (COBALT API) ==========

import type { CobaltSuccessResponse } from '../types';
import { COBALT_INSTANCES } from '../constants';

/**
 * Opcoes de configuracao para o download
 */
interface DownloadConfig {
  quality?: 'best' | '1080' | '720' | '480' | '360';
  format?: 'mp4' | 'webm';
}

/**
 * Obtem URL de download do video via Cobalt API
 * Tenta multiplas instancias com fallback automatico
 */
export async function getDownloadUrl(
  videoId: string,
  config: DownloadConfig = {}
): Promise<CobaltSuccessResponse> {
  const videoUrl = `https://youtube.com/watch?v=${videoId}`;
  return getDownloadUrlFromCobalt(videoUrl, config);
}

/**
 * Obtem URL de download de qualquer URL suportada pelo Cobalt
 * (YouTube, Instagram, etc.)
 */
export async function getDownloadUrlFromCobalt(
  url: string,
  config: DownloadConfig = {}
): Promise<CobaltSuccessResponse> {
  const { quality = 'best' } = config;

  const body = {
    url,
    downloadMode: 'auto' as const,
    videoQuality: quality === 'best' ? '1080' : quality,
  };

  let lastError: Error | null = null;

  for (const instance of COBALT_INSTANCES) {
    try {
      const response = await fetch(`${instance}/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error?.code || 'Cobalt returned error');
      }

      if (data.status === 'redirect' || data.status === 'tunnel') {
        return {
          status: data.status,
          url: data.url,
          filename: data.filename || `download_${Date.now()}.mp4`,
        };
      }

      if (data.status === 'picker' && data.picker?.length > 0) {
        // For picker responses (e.g. Instagram carousels), use the first item
        return {
          status: 'redirect',
          url: data.picker[0].url,
          filename: data.filename || `download_${Date.now()}.mp4`,
        };
      }

      throw new Error(`Unexpected Cobalt response status: ${data.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Cobalt instance ${instance} failed:`, lastError.message);
      continue;
    }
  }

  throw new Error(
    `Todas as instancias Cobalt falharam. Ultimo erro: ${lastError?.message || 'desconhecido'}`
  );
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
 * Verifica se alguma instancia Cobalt esta disponivel
 */
export async function checkCobaltAvailability(): Promise<boolean> {
  for (const instance of COBALT_INSTANCES) {
    try {
      const response = await fetch(`${instance}/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          downloadMode: 'auto',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
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
