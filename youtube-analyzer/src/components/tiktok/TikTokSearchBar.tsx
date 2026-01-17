// ========== COMPONENTE: BARRA DE INFO TIKTOK ==========

import { RefreshCw, Loader2, User } from 'lucide-react';
import { useTikTok } from '../../contexts';

export function TikTokSearchBar() {
  const { username, profile, isLoading, isSyncing, error, syncVideos } = useTikTok();

  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info do perfil fixo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#25f4ee] to-[#fe2c55] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">@{username}</h2>
            <p className="text-dark-400 text-sm">
              {isLoading ? (
                'Carregando...'
              ) : profile ? (
                `${profile.videoCount} videos no banco`
              ) : (
                'Clique em Atualizar para buscar videos'
              )}
            </p>
          </div>
        </div>

        {/* Botao de atualizar */}
        <button
          onClick={syncVideos}
          disabled={isLoading || isSyncing}
          className="px-6 py-2.5 bg-gradient-to-r from-[#25f4ee] to-[#fe2c55] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar Dados</span>
            </>
          )}
        </button>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-red-500 text-sm mt-3 text-center sm:text-left">
          Erro: {error}
        </p>
      )}

      {/* Info */}
      <p className="text-dark-400 text-xs mt-3 text-center sm:text-left">
        Os videos sao carregados do banco de dados. Clique em "Atualizar Dados" para buscar novos videos do TikTok.
      </p>
    </div>
  );
}
