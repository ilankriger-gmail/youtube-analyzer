// ========== COMPONENTE: BOTAO DE SINCRONIZACAO ==========

import { Database, Loader2, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui';
import { useVideoContext } from '../../contexts/VideoContext';

interface SyncButtonProps {
  className?: string;
}

export function SyncButton({ className = '' }: SyncButtonProps) {
  const { syncToDatabase, isSyncing, isDatabaseAvailable } = useVideoContext();
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const handleSync = async () => {
    setLastResult(null);
    const result = await syncToDatabase();
    setLastResult(result.success ? 'success' : 'error');

    // Limpa o indicador apos 3 segundos
    setTimeout(() => setLastResult(null), 3000);
  };

  // Icone baseado no estado
  const getIcon = () => {
    if (isSyncing) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (lastResult === 'success') {
      return <Check className="w-4 h-4 text-green-400" />;
    }
    if (lastResult === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <Database className="w-4 h-4" />;
  };

  // Texto do botao
  const getText = () => {
    if (isSyncing) return 'Sincronizando...';
    if (lastResult === 'success') return 'Sincronizado!';
    if (lastResult === 'error') return 'Erro';
    return 'Sincronizar DB';
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className={`${className} ${
        lastResult === 'success'
          ? 'border-green-500/50 text-green-400'
          : lastResult === 'error'
          ? 'border-red-500/50 text-red-400'
          : ''
      }`}
      leftIcon={getIcon()}
      title={
        isDatabaseAvailable
          ? 'Sincronizar dados com banco de dados Neon'
          : 'Banco de dados nao disponivel - clique para tentar conectar'
      }
    >
      {getText()}
    </Button>
  );
}
