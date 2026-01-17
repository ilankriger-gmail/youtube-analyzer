// ========== HOOK: HISTORICO DE METRICAS ==========

import { useState, useEffect, useCallback } from 'react';
import { fetchMetricsHistory } from '../services/neon.service';
import type { MetricsSnapshot, MetricsGrowth } from '../types';

interface UseMetricsHistoryResult {
  history: MetricsSnapshot[];
  latest: MetricsSnapshot | null;
  growth: MetricsGrowth | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para buscar historico de metricas de um video
 */
export function useMetricsHistory(
  videoId: string | null,
  days: number = 30
): UseMetricsHistoryResult {
  const [history, setHistory] = useState<MetricsSnapshot[]>([]);
  const [latest, setLatest] = useState<MetricsSnapshot | null>(null);
  const [growth, setGrowth] = useState<MetricsGrowth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!videoId) {
      setHistory([]);
      setLatest(null);
      setGrowth(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchMetricsHistory(videoId, days);
      setHistory(response.history);
      setLatest(response.latest);
      setGrowth(response.growth);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar historico';
      setError(message);
      console.error('Erro ao buscar historico:', err);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    latest,
    growth,
    isLoading,
    error,
    refresh: fetchHistory,
  };
}
