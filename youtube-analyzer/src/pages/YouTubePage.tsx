// ========== SECAO: PAGINA YOUTUBE ==========

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  VideoProvider,
  FilterProvider,
  SelectionProvider,
  DownloadProvider,
} from '../contexts';
import { MainLayout } from '../layouts';

/**
 * Pagina da ferramenta YouTube
 * Contem todos os providers necessarios para a funcionalidade
 */
export function YouTubePage() {
  return (
    <VideoProvider>
      <FilterProvider>
        <SelectionProvider>
          <DownloadProvider>
            {/* Botao voltar */}
            <div className="fixed top-4 left-4 z-50">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Menu</span>
              </Link>
            </div>
            <MainLayout />
          </DownloadProvider>
        </SelectionProvider>
      </FilterProvider>
    </VideoProvider>
  );
}
