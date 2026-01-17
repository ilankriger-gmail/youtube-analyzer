// ========== SECAO: COMPONENTE HEADER ==========

import { Youtube, RefreshCw, Users, LogOut } from 'lucide-react';
import { Button, Spinner } from '../components/ui';
import { SyncButton, SyncStatus } from '../components/sync';
import { useVideos } from '../hooks';
import { useAuth } from '../contexts';
import { formatCompactNumber } from '../utils/number.utils';
import { UI_TEXT, CHANNEL_HANDLE } from '../constants';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { channelInfo, isLoading, refreshVideos, stats } = useVideos();
  const { logout, userEmail } = useAuth();

  return (
    <header className={`bg-dark-850 border-b border-dark-700 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo e titulo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-100">
                {UI_TEXT.appTitle}
              </h1>
              <p className="text-sm text-dark-400">
                {UI_TEXT.appSubtitle} {CHANNEL_HANDLE}
              </p>
            </div>
          </div>

          {/* Info do canal */}
          {channelInfo && (
            <div className="flex items-center gap-6">
              {/* Avatar do canal */}
              <div className="flex items-center gap-3">
                <img
                  src={channelInfo.thumbnailUrl}
                  alt={channelInfo.title}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-dark-100">
                    {channelInfo.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-dark-400">
                    <Users className="w-3 h-3" />
                    <span>{formatCompactNumber(channelInfo.subscriberCount)} inscritos</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-dark-400">
                <div className="text-center">
                  <p className="font-semibold text-dark-100">{stats.total}</p>
                  <p className="text-xs">Videos</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-400">{stats.shorts}</p>
                  <p className="text-xs">Shorts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-400">{stats.longs}</p>
                  <p className="text-xs">Longos</p>
                </div>
              </div>
            </div>
          )}

          {/* Acoes e Status */}
          <div className="flex items-center gap-3">
            {/* Status da fonte de dados */}
            <SyncStatus showLabel={false} />

            {/* Botao de Sync com DB */}
            <SyncButton />

            {/* Botao refresh YouTube API */}
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshVideos}
              disabled={isLoading}
              leftIcon={
                isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )
              }
            >
              Atualizar
            </Button>

            {/* Separador */}
            <div className="h-6 w-px bg-dark-600" />

            {/* Usuario e Logout */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-400 hidden sm:block">
                {userEmail}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-dark-400 hover:text-red-400"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
