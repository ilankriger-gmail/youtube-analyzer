// ========== SECAO: PAGINA INSTAGRAM - REDIRECT ==========

import { useEffect } from 'react';

/**
 * Redireciona para o Instagram Analyzer (aplicacao separada)
 */
export function InstagramPage() {
  useEffect(() => {
    window.location.href = 'http://localhost:3002';
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-dark-400">Redirecionando para Instagram Analyzer...</p>
      </div>
    </div>
  );
}
