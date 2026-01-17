// ========== SECAO: UTILITARIOS DE CSV ==========

import type { Video } from '../types';

/**
 * Formata data para CSV (DD/MM/YYYY)
 */
function formatDateForCSV(date: Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Escapa valor para CSV (adiciona aspas e escapa aspas internas)
 */
function escapeCSVValue(value: string | number): string {
  const str = String(value);
  // Se contiver virgula, aspas ou quebra de linha, envolver em aspas
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Gera CSV com dados dos videos e dispara download
 */
export function generateVideoCSV(videos: Video[]): void {
  // Headers
  const headers = [
    'Nome',
    'Views',
    'Likes',
    'Comentarios',
    'Ratio Likes (1:X)',
    'Ratio Comments (1:X)',
    'Data Publicacao',
    'Duracao (s)',
    'Tipo',
    'URL'
  ];

  // Rows
  const rows = videos.map(video => {
    const likesRatio = video.likeCount > 0
      ? Math.round(video.viewCount / video.likeCount)
      : 0;
    const commentsRatio = video.commentCount > 0
      ? Math.round(video.viewCount / video.commentCount)
      : 0;

    return [
      escapeCSVValue(video.title),
      video.viewCount,
      video.likeCount,
      video.commentCount,
      likesRatio,
      commentsRatio,
      formatDateForCSV(video.publishedAt),
      video.duration,
      video.isShort ? 'Short' : 'Longo',
      `https://youtube.com/watch?v=${video.id}`
    ];
  });

  // Monta CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => escapeCSVValue(cell)).join(','))
  ].join('\n');

  // Adiciona BOM para UTF-8 (Excel abre corretamente)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Gera nome do arquivo com timestamp
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `videos_download_${timestamp}.csv`;

  // Dispara download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpa URL apos delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
