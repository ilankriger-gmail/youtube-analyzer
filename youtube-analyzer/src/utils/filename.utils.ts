// ========== SECAO: UTILITARIOS DE NOME DE ARQUIVO ==========

import type { Video } from '../types';

/**
 * Limite maximo de caracteres no titulo do arquivo
 */
const MAX_TITLE_LENGTH = 50;

/**
 * Sanitiza string para uso em nome de arquivo
 * Remove caracteres especiais e substitui espacos por underscore
 */
export function sanitizeForFilename(text: string): string {
  return text
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove caracteres especiais (mantem letras, numeros, espacos)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    // Substitui espacos por underscore
    .replace(/\s+/g, '_')
    // Remove underscores duplicados
    .replace(/_+/g, '_')
    // Remove underscore no inicio/fim
    .replace(/^_|_$/g, '')
    // Limita tamanho
    .substring(0, MAX_TITLE_LENGTH)
    // Remove underscore no fim se ficou apos o corte
    .replace(/_$/, '');
}

/**
 * Gera nome de arquivo no formato: yt_[views]_[titulo].mp4
 * Ex: "yt_1500000_Desafio_Impossivel.mp4"
 */
export function generateFilename(video: Video): string {
  const sanitizedTitle = sanitizeForFilename(video.title);
  return `yt_${video.viewCount}_${sanitizedTitle}.mp4`;
}

/**
 * Gera nome de arquivo com prefixo customizado
 */
export function generateFilenameWithPrefix(
  video: Video,
  prefix: string
): string {
  const sanitizedTitle = sanitizeForFilename(video.title);
  return `${prefix}_${video.viewCount}_${sanitizedTitle}.mp4`;
}

/**
 * Extrai informacoes de um nome de arquivo gerado
 */
export function parseGeneratedFilename(filename: string): {
  platform: string;
  views: number;
  title: string;
} | null {
  const match = filename.match(/^([a-z]+)_(\d+)_(.+)\.mp4$/);
  if (!match) return null;

  return {
    platform: match[1],
    views: parseInt(match[2], 10),
    title: match[3].replace(/_/g, ' '),
  };
}
