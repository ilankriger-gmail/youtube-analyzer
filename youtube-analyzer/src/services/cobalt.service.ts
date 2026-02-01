// ========== SECAO: SERVICO DE DOWNLOAD (COBALT API + SERVER FALLBACK) ==========

import type { CobaltSuccessResponse } from '../types';
import { COBALT_INSTANCES, DOWNLOAD_API_URL } from '../constants';

/**
 * Use proxy API on Vercel to avoid CORS issues
 */
const USE_PROXY = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

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

  // If on Vercel, use the proxy API to bypass CORS
  if (USE_PROXY) {
    try {
      const response = await fetch('/api/cobalt', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Proxy HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error?.code || data.error || 'Cobalt returned error');
      }

      if (data.status === 'redirect') {
        return {
          status: data.status,
          url: data.url,
          filename: data.filename || `download_${Date.now()}.mp4`,
        };
      }

      if (data.status === 'tunnel') {
        // Tunnel URLs have CORS restrictions - proxy through our Vercel endpoint
        const fname = data.filename || `download_${Date.now()}.mp4`;
        const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(data.url)}&filename=${encodeURIComponent(fname)}`;
        return {
          status: 'redirect',
          url: proxyUrl,
          filename: fname,
        };
      }

      if (data.status === 'picker' && data.picker?.length > 0) {
        const fname = data.filename || `download_${Date.now()}.mp4`;
        const pickerUrl = data.picker[0].url;
        // Also proxy picker URLs to avoid CORS
        const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(pickerUrl)}&filename=${encodeURIComponent(fname)}`;
        return {
          status: 'redirect',
          url: proxyUrl,
          filename: fname,
        };
      }

      throw new Error(`Unexpected Cobalt response status: ${data.status}`);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Direct mode (local dev or non-Vercel)
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

  // Validate content type - reject HTML error pages
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('Servidor retornou HTML em vez de vídeo (URL expirada ou rate limit)');
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  // Reject suspiciously small files (< 50KB is likely an error)
  if (total > 0 && total < 50000) {
    throw new Error(`Arquivo muito pequeno (${Math.round(total / 1024)}KB) - provavelmente erro do servidor`);
  }

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

  // Final size check
  if (received < 50000) {
    throw new Error(`Download incompleto (${Math.round(received / 1024)}KB) - tente novamente`);
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

// ========== SERVER-SIDE DOWNLOAD (yt-dlp via Railway) ==========

/**
 * Builds the server-side download URL for a video.
 * The browser will handle the actual download natively via iframe/window.
 */
export function getServerDownloadUrl(
  videoId: string,
  filename: string,
  quality: string = '720'
): string {
  const params = new URLSearchParams({
    videoId,
    quality,
    filename,
  });
  return `${DOWNLOAD_API_URL}/api/download?${params.toString()}`;
}

/**
 * Triggers a file download via hidden link click.
 * The server responds with Content-Disposition: attachment, so the browser
 * handles it as a native download without navigating away.
 * Resolves after a short delay to allow the browser to start the download.
 */
export function triggerServerDownload(
  videoId: string,
  filename: string,
  quality: string = '720'
): Promise<void> {
  return new Promise((resolve) => {
    const url = getServerDownloadUrl(videoId, filename, quality);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Give the browser a moment to initiate the download
    setTimeout(resolve, 1500);
  });
}

/**
 * Checks if the server-side download API is available
 */
export async function checkServerAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${DOWNLOAD_API_URL}/api/check`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.ready === true;
    }
    return false;
  } catch {
    return false;
  }
}
