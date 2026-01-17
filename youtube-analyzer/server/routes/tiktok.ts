// ========== ROTAS TIKTOK ==========

import { Router, Request, Response } from 'express';
import {
  isValidTikTokUrl,
  getTikTokVideoInfo,
  getTikTokProfile,
  downloadTikTokVideo,
  formatViews,
  sanitizeFilename,
  fetchTikTokVideosFromDB,
  syncTikTokWithDatabase,
  TIKTOK_FIXED_USERNAME,
  type VideoQuality,
} from '../services/tiktok.service.js';

const router = Router();

// ========== GET /api/tiktok/videos ==========
// Retorna videos do banco de dados (perfil fixo @nextleveldj)

router.get('/videos', async (_req: Request, res: Response) => {
  try {
    console.log(`[TIKTOK] Buscando videos do banco para @${TIKTOK_FIXED_USERNAME}`);
    const videos = await fetchTikTokVideosFromDB();

    res.json({
      success: true,
      username: TIKTOK_FIXED_USERNAME,
      videoCount: videos.length,
      videos,
    });
  } catch (error) {
    console.error('[TIKTOK] Erro ao buscar videos do banco:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== POST /api/tiktok/sync ==========
// Sincroniza videos do TikTok com o banco de dados

router.post('/sync', async (req: Request, res: Response) => {
  const { limit = 2000 } = req.body;

  try {
    console.log(`[TIKTOK] Iniciando sincronizacao de @${TIKTOK_FIXED_USERNAME}`);
    const result = await syncTikTokWithDatabase(Math.min(limit, 2000));

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json({
      success: true,
      username: TIKTOK_FIXED_USERNAME,
      videosCount: result.videosCount,
      videos: result.videos,
    });
  } catch (error) {
    console.error('[TIKTOK] Erro na sincronizacao:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== POST /api/tiktok/validate ==========
// Valida URLs do TikTok e retorna info dos videos

router.post('/validate', async (req: Request, res: Response) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    res.status(400).json({ error: 'Array de URLs e obrigatorio' });
    return;
  }

  const results = await Promise.all(
    urls.map(async (url: string) => {
      try {
        if (!isValidTikTokUrl(url)) {
          return { valid: false, url, error: 'URL invalida' };
        }
        return await getTikTokVideoInfo(url);
      } catch (error) {
        return {
          valid: false,
          url,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    })
  );

  res.json({ results });
});

// ========== POST /api/tiktok/profile ==========
// Busca videos de um perfil

router.post('/profile', async (req: Request, res: Response) => {
  const { username, limit = 2000 } = req.body;

  if (!username) {
    res.status(400).json({ success: false, error: 'Username e obrigatorio' });
    return;
  }

  try {
    console.log(`[TIKTOK] Iniciando busca de perfil: @${username}`);
    const result = await getTikTokProfile(username, Math.min(limit, 2000));
    res.json(result);
  } catch (error) {
    console.error('[TIKTOK] Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== GET /api/tiktok/info ==========
// Retorna info de um video especifico

router.get('/info', async (req: Request, res: Response) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Parametro url e obrigatorio' });
    return;
  }

  if (!isValidTikTokUrl(url)) {
    res.status(400).json({ error: 'URL do TikTok invalida' });
    return;
  }

  try {
    const info = await getTikTokVideoInfo(url);
    res.json(info);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter informacoes do video',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== GET /api/tiktok/download ==========
// Baixa video do TikTok

router.get('/download', async (req: Request, res: Response) => {
  const { url, quality = 'best', title = 'video', views = '0' } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Parametro url e obrigatorio' });
    return;
  }

  if (!isValidTikTokUrl(url)) {
    res.status(400).json({ error: 'URL do TikTok invalida' });
    return;
  }

  // Validar qualidade
  const validQualities: VideoQuality[] = ['best', '1080', '720', '480', '360', 'audio'];
  const selectedQuality = validQualities.includes(quality as VideoQuality)
    ? (quality as VideoQuality)
    : 'best';

  const isAudioOnly = selectedQuality === 'audio';
  const ext = isAudioOnly ? 'mp3' : 'mp4';

  // Formatar views para nome do arquivo
  const viewsFormatted = formatViews(parseInt(views as string) || 0);

  // Nome do arquivo seguro
  const safeTitle = sanitizeFilename(title as string).substring(0, 100);
  const filename = `TT - ${viewsFormatted} - ${safeTitle}.${ext}`;

  console.log(`[TIKTOK Download] Iniciando: ${url} @ ${selectedQuality}`);

  // Flag para detectar se cliente desconectou
  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
    console.log('[TIKTOK Download] Cliente desconectou');
  });

  try {
    const result = await downloadTikTokVideo(
      url,
      { quality: selectedQuality, filename },
      (progress) => {
        console.log(`[TIKTOK Download] Progresso: ${progress}%`);
      }
    );

    if (clientDisconnected) {
      console.log('[TIKTOK Download] Cancelado - cliente desconectou');
      await result.cleanup();
      return;
    }

    console.log(`[TIKTOK Download] Arquivo pronto: ${result.fileSize} bytes`);

    // Headers para download
    res.setHeader('Content-Type', isAudioOnly ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', result.fileSize.toString());

    // Stream do arquivo para o cliente
    const fileStream = result.createStream();

    fileStream.on('end', async () => {
      console.log(`[TIKTOK Download] Concluido: ${url}`);
      await result.cleanup();
    });

    fileStream.on('error', async (error) => {
      console.error('[TIKTOK Download] Erro ao ler arquivo:', error);
      await result.cleanup();
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao enviar arquivo' });
      }
    });

    req.on('close', async () => {
      if (!fileStream.destroyed) {
        fileStream.destroy();
      }
      await result.cleanup();
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('[TIKTOK Download] Erro:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao baixar video',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
});

export default router;
