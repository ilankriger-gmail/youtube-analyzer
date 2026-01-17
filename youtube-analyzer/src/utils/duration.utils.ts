// ========== SECAO: UTILITARIOS DE DURACAO ==========

/**
 * Limite em segundos para considerar um video como Short (3 minutos)
 */
export const SHORT_DURATION_LIMIT = 180;

/**
 * Parse duracao ISO 8601 para segundos
 * Formato: PT#H#M#S (ex: "PT3M45S", "PT1H2M3S", "PT45S")
 */
export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formata segundos para exibicao (ex: "3:45" ou "1:23:45")
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Verifica se a duracao caracteriza um Short (< 3 minutos)
 */
export function isShortDuration(seconds: number): boolean {
  return seconds < SHORT_DURATION_LIMIT;
}

/**
 * Retorna texto descritivo da duracao
 */
export function getDurationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
}
