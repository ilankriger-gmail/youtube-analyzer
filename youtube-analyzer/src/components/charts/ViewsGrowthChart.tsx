// ========== COMPONENTE: GRAFICO DE CRESCIMENTO DE VIEWS ==========

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MetricsSnapshot } from '../../types';
import { formatCompactNumber } from '../../utils/number.utils';

interface ViewsGrowthChartProps {
  history: MetricsSnapshot[];
  className?: string;
  height?: number;
  metric?: 'views' | 'likes' | 'comments';
}

export function ViewsGrowthChart({
  history,
  className = '',
  height = 200,
  metric = 'views',
}: ViewsGrowthChartProps) {
  // Prepara dados para o grafico
  const chartData = useMemo(() => {
    return history.map((snapshot) => ({
      date: format(new Date(snapshot.recordedAt), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(snapshot.recordedAt), "dd 'de' MMMM", { locale: ptBR }),
      views: snapshot.viewCount,
      likes: snapshot.likeCount,
      comments: snapshot.commentCount,
    }));
  }, [history]);

  // Configuracao baseada na metrica selecionada
  const metricConfig = {
    views: {
      dataKey: 'views',
      color: '#3b82f6',
      label: 'Views',
    },
    likes: {
      dataKey: 'likes',
      color: '#22c55e',
      label: 'Likes',
    },
    comments: {
      dataKey: 'comments',
      color: '#a855f7',
      label: 'Comentarios',
    },
  };

  const config = metricConfig[metric];

  if (history.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-[${height}px] bg-dark-800 rounded-lg ${className}`}
      >
        <p className="text-dark-400 text-sm">
          Sem dados de historico. Sincronize para comecar a rastrear.
        </p>
      </div>
    );
  }

  if (history.length === 1) {
    return (
      <div
        className={`flex items-center justify-center h-[${height}px] bg-dark-800 rounded-lg ${className}`}
      >
        <p className="text-dark-400 text-sm">
          Apenas 1 ponto de dados. Sincronize novamente para ver a evolucao.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-dark-800 rounded-lg p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value: number) => [
              formatCompactNumber(value),
              config.label,
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
