// ========== COMPONENTE: BADGE DE CRESCIMENTO ==========

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricsGrowth } from '../../types';
import { formatCompactNumber } from '../../utils/number.utils';

interface MetricsGrowthBadgeProps {
  growth: MetricsGrowth | null;
  metric?: 'views' | 'likes' | 'comments';
  showAbsolute?: boolean;
  className?: string;
}

export function MetricsGrowthBadge({
  growth,
  metric = 'views',
  showAbsolute = false,
  className = '',
}: MetricsGrowthBadgeProps) {
  if (!growth) {
    return null;
  }

  const data = growth[metric];
  const isPositive = data.absolute > 0;
  const isNegative = data.absolute < 0;
  const isNeutral = data.absolute === 0;

  const getColors = () => {
    if (isPositive) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (isNegative) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-dark-400 bg-dark-700 border-dark-600';
  };

  const getIcon = () => {
    if (isPositive) return <TrendingUp className="w-3 h-3" />;
    if (isNegative) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
        border ${getColors()} ${className}
      `}
      title={`Crescimento nos ultimos ${growth.periodDays} dias (${growth.dataPoints} pontos de dados)`}
    >
      {getIcon()}
      <span>{formatPercentage(data.percentage)}</span>
      {showAbsolute && !isNeutral && (
        <span className="text-dark-400">
          ({isPositive ? '+' : ''}{formatCompactNumber(data.absolute)})
        </span>
      )}
    </span>
  );
}
