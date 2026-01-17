// ========== SECAO: COMPONENTE SMART SELECT BUTTONS ==========

import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Button } from '../ui';
import { useSelection } from '../../hooks';
import { UI_TEXT, TOP_N_COUNT } from '../../constants';

interface SmartSelectButtonsProps {
  className?: string;
}

export function SmartSelectButtons({ className = '' }: SmartSelectButtonsProps) {
  const { selectTopBest, selectTopWorst, clearSelection, selectionCount } = useSelection();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => selectTopBest(TOP_N_COUNT)}
        leftIcon={<TrendingUp className="w-4 h-4 text-green-400" />}
      >
        {UI_TEXT.selection.topBest}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => selectTopWorst(TOP_N_COUNT)}
        leftIcon={<TrendingDown className="w-4 h-4 text-red-400" />}
      >
        {UI_TEXT.selection.topWorst}
      </Button>

      {selectionCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          {UI_TEXT.selection.clear}
        </Button>
      )}
    </div>
  );
}
