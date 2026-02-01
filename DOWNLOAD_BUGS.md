# Download Bugs — Documentação (2026-02-01)

## Regras de Ouro para Downloads no Browser

1. **NUNCA usar `link.click()` sem esperar** — dispara download mas não espera completar. O browser ignora clicks seguintes enquanto o primeiro baixa.
2. **SEMPRE usar fetch+blob** — baixa o arquivo inteiro na memória, depois salva. Garante que cada download completa antes do próximo.
3. **SEMPRE validar a resposta** — checar content-type (rejeitar JSON/HTML) e tamanho mínimo (< 50KB = erro).
4. **NUNCA usar useState para cancel flags em loops async** — o valor é capturado na closure e nunca atualiza. Usar `useRef`.
5. **SEMPRE conferir dependency arrays** — se usa `processX` no corpo mas declara `processY` no array, a função pode estar stale.

---

## Bugs Corrigidos

### 🔴 BUG 1: Downloads só baixavam 1 vídeo (YouTube + Instagram)
- **Causa:** `link.click()` + `setTimeout(resolve, 1500)` — não esperava o download completar
- **Sintoma:** Primeiro vídeo baixava, os outros eram ignorados
- **Fix:** Trocar por `fetch()` → `response.blob()` → `URL.createObjectURL()` → `link.click()`
- **Afetava:** YouTube (`triggerServerDownload`), Instagram (`processItem`)

### 🔴 BUG 2: Botão Cancelar não funcionava (TikTok)
- **Causa:** `downloadCancelled` era `useState`, mas o valor era capturado pela closure no momento do `useCallback`. Mudar o state não atualiza a variável dentro do loop.
- **Fix:** Trocar `useState` por `useRef` (`cancelledRef.current = true`)
- **Afetava:** `TikTokContext.tsx`, `TikTokCreatorsContext.tsx`

### 🟡 BUG 3: Dependency array errado (YouTube)
- **Causa:** `startDownload` e `retryFailed` declaravam `processDownloadCobalt` no dependency array mas usavam `processDownloadServer` no corpo
- **Fix:** Corrigir para `processDownloadServer`
- **Afetava:** `DownloadContext.tsx`

### 🟡 BUG 4: Cookies do YouTube malformados (Railway yt-dlp)
- **Causa:** Env `YOUTUBE_COOKIES` tinha espaços em vez de tabs e trailing backslash `\` em cada linha
- **Sintoma:** `WARNING: skipping cookie file entry due to invalid length` + `HTTP 403`
- **Fix:** Função `sanitizeCookies()` limpa automaticamente: remove `\`, normaliza espaços→tabs, garante header Netscape
- **Afetava:** `server/services/ytdlp.service.ts`

### 🟢 BUG 5: Sem validação de resposta (TikTok)
- **Causa:** `downloadTikTokWithProgress` não verificava content-type nem tamanho mínimo
- **Fix:** Checar `content-type` (rejeitar JSON/HTML) e `received < 10KB`
- **Afetava:** `tiktok.service.ts`

---

## Padrão Correto de Download (copiar para novos features)

```typescript
// ✅ CORRETO: fetch + blob + progresso
async function downloadVideo(url: string, filename: string, onProgress: (n: number) => void) {
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.details || err.error);
  }

  // Validar content-type
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json') || ct.includes('text/html')) {
    throw new Error('Servidor retornou erro');
  }

  const total = parseInt(response.headers.get('content-length') || '0');
  const reader = response.body!.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress(Math.round((received / total) * 100));
  }

  if (received < 50000) throw new Error('Arquivo muito pequeno');

  const blob = new Blob(chunks, { type: 'video/mp4' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
}
```

```typescript
// ✅ CORRETO: cancel com useRef
const cancelledRef = useRef(false);

// No loop:
for (let i = 0; i < queue.length; i++) {
  if (cancelledRef.current) break;
  // ...
}

// No handler:
const cancel = () => { cancelledRef.current = true; };
```

```typescript
// ❌ ERRADO: link.click() sem esperar
link.click();
await new Promise(r => setTimeout(r, 1500)); // NÃO garante nada

// ❌ ERRADO: useState para cancel em loop async
const [cancelled, setCancelled] = useState(false);
// cancelled nunca atualiza dentro do loop!
```

---

## Status por Plataforma

| Plataforma | Método Download | Servidor | Status |
|-----------|----------------|----------|--------|
| YouTube | fetch+blob via Railway yt-dlp | youtube-analyzer-production-33b0.up.railway.app | ✅ Corrigido |
| Instagram | fetch+blob via Railway yt-dlp | instagram-analyzer-production-f8bf.up.railway.app | ✅ Corrigido |
| TikTok | fetch+blob via Railway yt-dlp | youtube-analyzer-production-33b0.up.railway.app | ✅ Corrigido |

## Cobalt Status
- **Bloqueado pelo Cloudflare** (retorna HTML em vez de JSON)
- Proxy na Vercel (`/api/cobalt`) ainda funciona mas tunnel URLs dão CORS
- Removido como método de download — pode voltar se Cloudflare desbloquear
