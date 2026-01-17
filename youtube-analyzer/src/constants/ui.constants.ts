// ========== SECAO: CONSTANTES DA UI ==========

/**
 * Limite maximo de videos selecionados (sem limite pratico)
 */
export const MAX_SELECTION = 9999;

/**
 * Quantidade para selecao automatica (Top N)
 */
export const TOP_N_COUNT = 5;

/**
 * Textos da interface em Portugues Brasil
 */
export const UI_TEXT = {
  // Header
  appTitle: 'YouTube Analyzer',
  appSubtitle: 'Analise e baixe videos do canal',

  // Filtros
  filters: {
    duration: {
      label: 'Duracao',
    },
    keyword: {
      label: 'Buscar',
      placeholder: 'Buscar no titulo ou descricao...',
    },
    date: {
      label: 'Periodo',
    },
    sort: {
      label: 'Ordenar por',
    },
    clear: 'Limpar filtros',
  },

  // Selecao
  selection: {
    counter: (count: number) =>
      `${count} selecionado${count !== 1 ? 's' : ''}`,
    topBest: 'Top 5 Melhores',
    topWorst: 'Top 5 Piores',
    clear: 'Limpar Selecao',
  },

  // Download
  download: {
    button: 'Baixar Selecionados',
    buttonWithCount: (count: number) =>
      `Baixar ${count} video${count > 1 ? 's' : ''}`,
    modalTitle: 'Download em Progresso',
    preparing: 'Preparando download...',
    downloading: 'Baixando...',
    processing: 'Processando...',
    completed: 'Concluido',
    failed: 'Falhou',
    retry: 'Tentar Novamente',
    cancel: 'Cancelar',
    cancelAll: 'Cancelar Todos',
    close: 'Fechar',
  },

  // Video Card
  video: {
    views: 'visualizacoes',
    short: 'Short',
    long: 'Video',
  },

  // Estados vazios
  empty: {
    noVideos: 'Nenhum video encontrado',
    noResults: 'Nenhum resultado para os filtros aplicados',
    tryAgain: 'Tente ajustar os filtros',
  },

  // Erros
  errors: {
    fetchFailed: 'Erro ao carregar videos',
    downloadFailed: 'Erro ao baixar video',
    apiError: 'Erro na API do YouTube',
    networkError: 'Erro de conexao',
    retry: 'Tentar novamente',
  },

  // Loading
  loading: {
    videos: 'Carregando videos...',
    channel: 'Carregando informacoes do canal...',
  },

  // View Toggle
  view: {
    grid: 'Grade',
    list: 'Lista',
  },
} as const;

/**
 * Formata numero de views para exibicao
 */
export function formatViews(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Formata numero de views com texto completo
 */
export function formatViewsWithLabel(count: number): string {
  return `${formatViews(count)} ${UI_TEXT.video.views}`;
}
