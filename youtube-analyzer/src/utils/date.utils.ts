// ========== SECAO: UTILITARIOS DE DATA ==========

import { format, formatDistanceToNow, subDays, subYears, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRangePreset, CustomDateRange } from '../types';

/**
 * Formata uma data para exibicao (ex: "15 jan 2024")
 */
export function formatDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: ptBR });
}

/**
 * Formata uma data para exibicao relativa (ex: "ha 3 dias")
 */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

/**
 * Formata data para exibicao compacta em cards
 */
export function formatDateCompact(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atras`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem atras`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atras`;

  return formatDate(date);
}

/**
 * Retorna a data de inicio baseada no preset de periodo
 */
export function getStartDateFromPreset(preset: DateRangePreset): Date | null {
  const now = new Date();

  switch (preset) {
    case '24h':
      return subDays(now, 1);
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case '90d':
      return subDays(now, 90);
    case '1y':
      return subYears(now, 1);
    case 'all':
    case 'custom':
    default:
      return null;
  }
}

/**
 * Verifica se uma data esta dentro do periodo especificado
 */
export function isDateInRange(
  date: Date,
  preset: DateRangePreset,
  customRange: CustomDateRange | null
): boolean {
  if (preset === 'all') return true;

  if (preset === 'custom' && customRange) {
    return isAfter(date, customRange.start) && isBefore(date, customRange.end);
  }

  const startDate = getStartDateFromPreset(preset);
  if (!startDate) return true;

  return isAfter(date, startDate);
}

/**
 * Formata data para input type="date"
 */
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse string de input date para Date
 */
export function parseDateInput(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}
