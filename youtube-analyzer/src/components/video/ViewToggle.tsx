// ========== SECAO: COMPONENTE VIEW TOGGLE ==========

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-1 bg-dark-800 rounded-lg p-1 ${className}`}>
      <Button
        variant={view === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        className="!px-2"
        title="Visualizar em grade"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="!px-2"
        title="Visualizar em lista"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
