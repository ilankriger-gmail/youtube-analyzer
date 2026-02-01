// ========== UNIFIED FILTERS MODULE (Instagram) ==========
// Same logic as the React applyUnifiedFilters but in vanilla JS

const Filters = {
  // Estado dos filtros (matches UnifiedFilterState)
  current: {
    search: '',
    period: 'all',         // 'all' | '7d' | '30d' | '60d' | '90d' | '180d' | '1y'
    viewsMin: null,
    viewsMax: null,
    durationMin: null,
    durationMax: null,
    durationPreset: 'all', // 'all' | 'short' (<60s) | 'medium' (60-180s) | 'long' (>180s)
    sort: 'views-desc',    // 'views-desc' | 'views-asc' | 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc'
  },

  // Duration preset ranges
  _durationPresets: {
    short: { min: 0, max: 60 },
    medium: { min: 60, max: 180 },
    long: { min: 180, max: Infinity },
  },

  // Period days map
  _periodDays: {
    '7d': 7,
    '30d': 30,
    '60d': 60,
    '90d': 90,
    '180d': 180,
    '1y': 365,
  },

  /**
   * Aplica filtros e ordenacao aos videos
   */
  apply(videos) {
    let filtered = videos.filter(video => {
      // 1. Filtro por texto (busca no caption)
      if (this.current.search) {
        const searchLower = this.current.search.toLowerCase();
        const caption = (video.caption || '').toLowerCase();
        const captionFull = (video.caption_full || '').toLowerCase();
        if (!caption.includes(searchLower) && !captionFull.includes(searchLower)) {
          return false;
        }
      }

      // 2. Filtro de periodo
      if (this.current.period !== 'all') {
        const days = this._periodDays[this.current.period];
        if (days) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          const videoDate = new Date(video.timestamp);
          if (videoDate < cutoff) return false;
        }
      }

      // 3. Filtro de views
      if (this.current.viewsMin !== null && video.views < this.current.viewsMin) return false;
      if (this.current.viewsMax !== null && video.views > this.current.viewsMax) return false;

      // 4. Filtro de duracao (preset ou manual)
      if (this.current.durationPreset !== 'all') {
        const range = this._durationPresets[this.current.durationPreset];
        if (range) {
          if (video.duration < range.min || video.duration >= range.max) return false;
        }
      } else {
        if (this.current.durationMin !== null && video.duration < this.current.durationMin) return false;
        if (this.current.durationMax !== null && video.duration > this.current.durationMax) return false;
      }

      return true;
    });

    // 5. Ordenacao
    filtered.sort((a, b) => {
      switch (this.current.sort) {
        case 'views-desc':
          return (b.views || 0) - (a.views || 0);
        case 'views-asc':
          return (a.views || 0) - (b.views || 0);
        case 'date-desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'date-asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'duration-desc':
          return (b.duration || 0) - (a.duration || 0);
        case 'duration-asc':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

    return filtered;
  },

  /**
   * Atualiza filtros a partir dos inputs do DOM
   */
  updateFromInputs() {
    const search = document.getElementById('filter-search')?.value || '';
    const period = document.getElementById('filter-period')?.value || 'all';
    const viewsMin = document.getElementById('filter-views-min')?.value;
    const viewsMax = document.getElementById('filter-views-max')?.value;
    const durationMin = document.getElementById('filter-duration-min')?.value;
    const durationMax = document.getElementById('filter-duration-max')?.value;
    const sort = document.getElementById('filter-sort')?.value || 'views-desc';

    this.current = {
      search,
      period,
      viewsMin: viewsMin ? parseInt(viewsMin) : null,
      viewsMax: viewsMax ? parseInt(viewsMax) : null,
      durationMin: durationMin ? parseInt(durationMin) : null,
      durationMax: durationMax ? parseInt(durationMax) : null,
      durationPreset: 'all', // manual inputs override preset
      sort,
    };
  },

  /**
   * Reseta filtros para valores padrao
   */
  reset() {
    this.current = {
      search: '',
      period: 'all',
      viewsMin: null,
      viewsMax: null,
      durationMin: null,
      durationMax: null,
      durationPreset: 'all',
      sort: 'views-desc',
    };

    // Limpa inputs
    const ids = ['filter-search', 'filter-views-min', 'filter-views-max', 'filter-duration-min', 'filter-duration-max'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const periodEl = document.getElementById('filter-period');
    if (periodEl) periodEl.value = 'all';

    const sortEl = document.getElementById('filter-sort');
    if (sortEl) sortEl.value = 'views-desc';
  },

  /**
   * Verifica se ha filtros ativos
   */
  hasActive() {
    return (
      this.current.search.trim() !== '' ||
      this.current.period !== 'all' ||
      this.current.viewsMin !== null ||
      this.current.viewsMax !== null ||
      this.current.durationMin !== null ||
      this.current.durationMax !== null ||
      this.current.durationPreset !== 'all' ||
      this.current.sort !== 'views-desc'
    );
  },
};
