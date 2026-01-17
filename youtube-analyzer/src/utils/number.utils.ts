// ========== SECAO: UTILITARIOS DE NUMEROS ==========

/**
 * Formata numero grande para exibicao compacta
 * Ex: 1500000 -> "1.5M", 45000 -> "45K"
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formata numero com separadores de milhar
 * Ex: 1500000 -> "1.500.000"
 */
export function formatNumberWithSeparator(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Parse string numerica para number (remove separadores)
 */
export function parseNumberString(str: string): number {
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

/**
 * Formata views com label
 */
export function formatViews(count: number, compact = true): string {
  const formatted = compact ? formatCompactNumber(count) : formatNumberWithSeparator(count);
  return `${formatted} visualizacoes`;
}

/**
 * Formata views de forma compacta sem label
 */
export function formatViewsCompact(count: number): string {
  return formatCompactNumber(count);
}
