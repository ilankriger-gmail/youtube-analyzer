# Plano: Reescrever Filtros do Zero — YouTube/TikTok/Instagram Analyzer

## Problema Atual
Os filtros das 3 plataformas são **inconsistentes entre si** e frequentemente retornam resultados errados:

### YouTube (React + FilterContext)
- `DurationFilter`: short/long baseado em `isShort` (< 60s) — simples demais
- `DateFilter`: presets fixos (24h, 7d, 30d, 90d, 1y) + custom range
- `SortOption`: newest, oldest, most_views, least_views — falta likes, comments, engagement
- **Sem filtro por views min/max** — diferente do TikTok e Instagram que têm
- **Sem filtro por duração exata** (min/max em segundos)

### TikTok (React + TikTokContext)
- Filtros inline no Context (não reutilizável)
- `minViews/maxViews`, `minDuration/maxDuration` — bom, mas duplicado
- `dateRange`: '7', '30', '60', '90', '365', 'all' — strings numéricas
- `searchText` — busca em title + channel

### Instagram (Vanilla JS — Filters object)
- Lógica separada no `filters.js`
- Tem `viewsMin/viewsMax`, `durationMin/durationMax`
- `period`: 'all', '7', '30', '90' — similar ao TikTok
- `sort`: most_views, least_views, newest, oldest, longest, shortest

### Resumo dos problemas:
1. **3 implementações diferentes** para a mesma funcionalidade
2. **Filtros inconsistentes** — YouTube não tem views min/max, Instagram tem duration sort
3. **Tipos diferentes** — YouTube usa types separados, TikTok usa inline, Instagram usa JS puro
4. **Ordenação incompleta** — YouTube falta sort por duration, likes, comments
5. **Duration filter binário** no YouTube (short/long) vs range nos outros

---

## Plano de Implementação

### Fase 1: Definir o filtro universal (shared types)

Criar um único sistema de filtros que funcione pras 3 plataformas.

**Arquivo:** `src/types/filter.types.ts` (reescrever)

```typescript
interface UnifiedFilterState {
  // Busca
  search: string;
  
  // Período
  period: 'all' | '7d' | '30d' | '60d' | '90d' | '180d' | '1y' | 'custom';
  customDateStart: Date | null;
  customDateEnd: Date | null;
  
  // Views
  viewsMin: number | null;
  viewsMax: number | null;
  
  // Duração (segundos)
  durationMin: number | null;
  durationMax: number | null;
  
  // Tipo rápido (atalho para duração)
  durationPreset: 'all' | 'short' | 'medium' | 'long';
  // short: < 60s, medium: 60-180s, long: > 180s
  
  // Ordenação
  sortBy: 'views-desc' | 'views-asc' | 'date-desc' | 'date-asc' | 
          'duration-desc' | 'duration-asc' | 'likes-desc' | 'engagement-desc';
}
```

### Fase 2: Função de filtro universal

**Arquivo:** `src/utils/filter.utils.ts` (novo)

Uma única função `applyFilters(items, filters, platform)` que:
1. Normaliza os dados de cada plataforma pro mesmo formato
2. Aplica todos os filtros em sequência
3. Ordena pelo campo selecionado
4. Retorna os resultados filtrados

Adaptadores por plataforma:
- `youtubeAdapter(video: Video)` → formato normalizado
- `tiktokAdapter(video: TikTokVideo)` → formato normalizado
- `instagramAdapter(video: IGVideo)` → formato normalizado

### Fase 3: Componente de filtro compartilhado (React)

**Arquivo:** `src/components/filters/UnifiedFilterBar.tsx` (novo, substitui FilterBar)

Layout em uma barra:
```
[🔍 Busca] [Período ▼] [Views ▼] [Duração ▼] [Ordenar ▼] [Limpar]
```

Cada dropdown abre um mini-form:
- **Período**: botões preset + date picker custom
- **Views**: dois inputs (min / max) com formatação (ex: "1M", "500K")
- **Duração**: preset buttons (Short/Médio/Longo) + range manual (min/max segundos)
- **Ordenar**: lista de opções (views, data, duração, likes, engagement)

Props:
```typescript
interface UnifiedFilterBarProps {
  platform: 'youtube' | 'tiktok' | 'instagram';
  filters: UnifiedFilterState;
  onChange: (filters: Partial<UnifiedFilterState>) => void;
  totalCount: number;
  filteredCount: number;
  // Campos disponíveis por plataforma (ex: Instagram não tem likes no scraper)
  availableFields?: ('views' | 'likes' | 'comments' | 'duration')[];
}
```

### Fase 4: Reescrever FilterContext

**Arquivo:** `src/contexts/FilterContext.tsx` (reescrever)

- Estado usa `UnifiedFilterState`
- Lógica de filtro usa `applyFilters()`
- Expõe handlers tipados
- Funciona com qualquer plataforma

### Fase 5: Integrar no TikTok

- Remover filtros inline do `TikTokContext.tsx`
- Usar `FilterContext` + `UnifiedFilterBar` na page do TikTok
- Adapter converte `TikTokVideo` → formato esperado

### Fase 6: Integrar no Instagram

- Reescrever `filters.js` para usar a mesma lógica
- OU migrar Instagram para React (mais trabalho, mas melhor longo prazo)
- Se manter vanilla JS: exportar a lógica de filtro como módulo JS standalone

### Fase 7: Deletar código antigo

- `src/components/filters/DurationFilter.tsx` → deletar
- `src/components/filters/DateFilter.tsx` → deletar
- `src/components/filters/SortFilter.tsx` → deletar
- `src/components/filters/KeywordFilter.tsx` → deletar
- `src/components/filters/DateRangePicker.tsx` → deletar
- `src/components/filters/FilterBar.tsx` → deletar
- Filtros inline do `TikTokContext.tsx` → remover
- `instagram-analyzer/public/js/filters.js` → reescrever

---

## Ordem de Execução

```
1. Criar tipos UnifiedFilterState            [10 min]
2. Criar filter.utils.ts com lógica pura     [20 min]
3. Criar UnifiedFilterBar.tsx                 [30 min]
4. Reescrever FilterContext.tsx               [15 min]
5. Integrar na page YouTube                  [10 min]
6. Testar YouTube                            [5 min]
7. Integrar na page TikTok                   [15 min]
8. Testar TikTok                             [5 min]
9. Reescrever filters.js do Instagram        [15 min]
10. Testar Instagram                         [5 min]
11. Deletar código antigo                    [5 min]
12. Build + deploy                           [5 min]
```

**Tempo total estimado: ~2h20**

---

## Regras

1. **Uma lógica, 3 plataformas** — zero duplicação
2. **Filtros nunca retornam resultado errado** — testes manuais em cada etapa
3. **UI consistente** — mesma barra de filtros em todas as plataformas, com cores da plataforma
4. **Valores persistem** — filtros salvos no localStorage por plataforma
5. **Performance** — useMemo em tudo, sem re-render desnecessário
