# YouTube Analyzer

Ferramenta web para analisar e baixar videos do canal @nextleveldj1. Desenvolvida para criadores de conteudo que precisam identificar padroes em videos de sucesso/fracasso e baixar videos para analise offline.

## Funcionalidades

### Busca de Videos
- Canal fixo: @nextleveldj1
- Filtro por tipo: Shorts (< 60s) | Longos (> 60s) | Todos
- Filtro por palavra-chave no titulo/descricao
- Filtro por periodo: 24h, 7 dias, 30 dias, 90 dias, 1 ano, periodo customizado
- Ordenacao: mais recentes, mais antigos, mais views, menos views

### Exibicao dos Resultados
- Grid responsivo ou lista
- Thumbnail, titulo, views, data, duracao
- Badge visual para Short ou Long
- Checkbox para selecao multipla

### Selecao Inteligente
- Selecao manual via checkbox (limite: 10 videos)
- Botao "Top 5 Melhores" (auto-seleciona 5 com mais views)
- Botao "Top 5 Piores" (auto-seleciona 5 com menos views)
- Botao "Limpar selecao"

### Download
- Download dos videos selecionados via Cobalt API
- Renomeacao automatica: `yt_[views]_[titulo].mp4`
- Barra de progresso por video
- Modal com fila de downloads

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilizacao)
- **axios** (requisicoes HTTP)
- **date-fns** (manipulacao de datas)
- **lucide-react** (icones)

## Requisitos

- Node.js 18+
- npm ou yarn
- Chave da API do YouTube Data v3

## Instalacao

1. Clone o repositorio ou navegue ate a pasta:
```bash
cd youtube-analyzer
```

2. Instale as dependencias:
```bash
npm install
```

3. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

4. Configure sua chave da API do YouTube no arquivo `.env`:
```env
VITE_YOUTUBE_API_KEY=sua_chave_aqui
```

### Como obter a API Key do YouTube

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto (ou selecione um existente)
3. Va em "APIs e Servicos" > "Biblioteca"
4. Busque por "YouTube Data API v3" e ative
5. Va em "Credenciais" > "Criar credenciais" > "Chave de API"
6. Copie a chave gerada para o arquivo `.env`

## Executando

### Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

### Build de Producao
```bash
npm run build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes base (Button, Input, Modal...)
│   ├── filters/     # Filtros de busca
│   ├── video/       # Cards e listas de videos
│   └── download/    # Selecao e download
├── contexts/        # Estado global (Video, Filter, Selection, Download)
├── hooks/           # Hooks customizados
├── services/        # APIs (YouTube, Cobalt, Storage)
├── types/           # Interfaces TypeScript
├── utils/           # Funcoes utilitarias
├── constants/       # Constantes e textos PT-BR
└── layouts/         # Header e Layout principal
```

## Limitacoes do MVP

1. **Canal fixo** - Apenas @nextleveldj1 (hardcoded)
2. **Dependencia externa** - Downloads via Cobalt API
3. **Frontend-only** - Sem backend proprio
4. **Sem autenticacao** - Chave da API exposta no frontend
5. **Cache local** - Apenas localStorage (30 min)

## Quota da API do YouTube

A aplicacao usa uma estrategia eficiente de quota:
- `channels.list`: 1 unidade
- `playlistItems.list`: 1 unidade por 50 videos
- `videos.list`: 1 unidade por 50 videos

Com 10.000 unidades diarias (padrao), a aplicacao suporta ~2.000 atualizacoes/dia.

## Roadmap

### v2 - TikTok
- Adicionar servico para TikTok
- Seletor de plataforma na UI
- Unificar tipos entre plataformas

### v3 - Instagram
- Adicionar servico para Instagram
- Dashboard multi-plataforma
- Comparativo de performance

## Solucao de Problemas

### "API Key nao configurada"
Verifique se o arquivo `.env` existe e contem `VITE_YOUTUBE_API_KEY`.

### "Canal nao encontrado"
O handle @nextleveldj1 pode estar incorreto. Verifique se o canal existe.

### "Erro no download"
A API Cobalt pode estar indisponivel. Use o link externo para abrir o video no YouTube.

### CORS errors
Se usando Cobalt, pode ser necessario usar uma instancia propria ou proxy CORS.

## Licenca

Projeto privado para uso interno.
# trigger deploy
