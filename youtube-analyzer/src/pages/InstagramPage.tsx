// ========== SECAO: PAGINA INSTAGRAM - DOWNLOAD VIA COBALT ==========

import { useState } from 'react';
import { Download, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getDownloadUrlFromCobalt } from '../services/cobalt.service';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function InstagramPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const isValidInstagramUrl = (input: string): boolean => {
    return /instagram\.com\/(p|reel|reels|tv|stories)\//.test(input);
  };

  const handleDownload = async () => {
    if (!url.trim()) return;

    if (!isValidInstagramUrl(url)) {
      setError('URL inválida. Cole um link de post, reel ou story do Instagram.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const response = await getDownloadUrlFromCobalt(url);

      // Open the download URL in a new tab
      const link = document.createElement('a');
      link.href = response.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = response.filename || 'instagram_download.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar. Tente novamente.');
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && status !== 'loading') {
      handleDownload();
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-100">Instagram Downloader</h1>
          <p className="text-dark-400 mt-2">Cole o link de um post, reel ou story para baixar</p>
        </div>

        {/* Input Card */}
        <div className="bg-dark-850 border border-dark-700 rounded-2xl p-6">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 w-5 h-5" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://www.instagram.com/reel/..."
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 pl-11 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-pink-500 transition-colors"
              disabled={status === 'loading'}
            />
          </div>

          {/* Error message */}
          {status === 'error' && error && (
            <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {status === 'success' && (
            <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Download iniciado!</span>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={!url.trim() || status === 'loading'}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Baixar
              </>
            )}
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-dark-500 text-sm mt-6">
          Suporta posts, reels e stories públicos do Instagram
        </p>
      </div>
    </div>
  );
}
