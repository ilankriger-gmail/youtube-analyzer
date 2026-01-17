// ========== SECAO: COMPONENTE SELECTION BAR ==========

import { CheckSquare } from 'lucide-react';
import { SmartSelectButtons } from './SmartSelectButtons';
import { DownloadButton } from './DownloadButton';
import { useSelection } from '../../hooks';
import { UI_TEXT } from '../../constants';

interface SelectionBarProps {
  className?: string;
}

export function SelectionBar({ className = '' }: SelectionBarProps) {
  const { selectionCount } = useSelection();

  return (
    <div
      className={`
        flex flex-wrap items-center justify-between gap-4
        p-4 bg-dark-850 border border-dark-700 rounded-xl
        ${className}
      `}
    >
      {/* Lado esquerdo: Contador + Smart Select */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Contador */}
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-dark-200">
            {UI_TEXT.selection.counter(selectionCount)}
          </span>
        </div>

        {/* Botoes de selecao inteligente */}
        <SmartSelectButtons />
      </div>

      {/* Lado direito: Botao de download */}
      <DownloadButton />
    </div>
  );
}
