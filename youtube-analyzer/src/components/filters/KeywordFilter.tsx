// ========== SECAO: COMPONENTE KEYWORD FILTER ==========

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Button } from '../ui';
import { useFilters } from '../../hooks';
import { UI_TEXT } from '../../constants';

interface KeywordFilterProps {
  className?: string;
}

export function KeywordFilter({ className = '' }: KeywordFilterProps) {
  const { filters, setKeyword } = useFilters();
  const [localValue, setLocalValue] = useState(filters.keyword);

  // Sincroniza com estado externo
  useEffect(() => {
    setLocalValue(filters.keyword);
  }, [filters.keyword]);

  // Debounce para nao filtrar a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== filters.keyword) {
        setKeyword(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, filters.keyword, setKeyword]);

  const handleClear = () => {
    setLocalValue('');
    setKeyword('');
  };

  return (
    <div className={className}>
      <Input
        label={UI_TEXT.filters.keyword.label}
        placeholder={UI_TEXT.filters.keyword.placeholder}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          localValue ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="!p-0.5"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
