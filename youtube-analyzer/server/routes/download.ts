// ========== ROTAS DE DOWNLOAD ==========

import { Router, Request, Response } from 'express';
import {
  checkYtdlp,
  checkFfmpeg,
  getVideoInfo,
  downloadVideoToFile,
  isValidYouTubeUrl,
  buildYouTubeUrl,
  extractVideoId,
  type VideoQuality,
} from '../services/ytdlp.service.js';

const router = Router();

// ========== GET /api/check ==========
// Verifica se yt-dlp e ffmpeg estao instalados

router.get('/check', async (_req: Request, res: Response) => {
  try {
    const [ytdlp, ffmpeg] = await Promise.all([
      checkYtdlp(),
      checkFfmpeg(),
    ]);

    res.json({
      ytdlp,
      ffmpeg,
      ready: ytdlp.installed && ffmpeg.installed,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao verificar ferramentas',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== GET /api/info ==========
// Retorna metadados do video

router.get('/info', async (req: Request, res: Response) => {
  const { url, videoId } = req.query;

  // Aceita URL completa ou apenas videoId
  let videoUrl: string;

  if (url && typeof url === 'string') {
    if (!isValidYouTubeUrl(url)) {
      res.status(400).json({ error: 'URL do YouTube invalida' });
      return;
    }
    videoUrl = url;
  } else if (videoId && typeof videoId === 'string') {
    videoUrl = buildYouTubeUrl(videoId);
  } else {
    res.status(400).json({ error: 'Parametro url ou videoId e obrigatorio' });
    return;
  }

  try {
    const info = await getVideoInfo(videoUrl);
    res.json(info);
  } catch (error) {
    console.error('Erro ao obter info:', error);
    res.status(500).json({
      error: 'Erro ao obter informacoes do video',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========== GET /api/download ==========
// Baixa o video para arquivo temp, depois streama para o cliente

router.get('/download', async (req: Request, res: Response) => {
  const { url, videoId, quality = '720', filename } = req.query;

  // Aceita URL completa ou apenas videoId
  let videoUrl: string;
  let videoIdExtracted: string | null = null;

  if (url && typeof url === 'string') {
    if (!isValidYouTubeUrl(url)) {
      res.status(400).json({ error: 'URL do YouTube invalida' });
      return;
    }
    videoUrl = url;
    videoIdExtracted = extractVideoId(url);
  } else if (videoId && typeof videoId === 'string') {
    videoUrl = buildYouTubeUrl(videoId);
    videoIdExtracted = videoId;
  } else {
    res.status(400).json({ error: 'Parametro url ou videoId e obrigatorio' });
    return;
  }

  // Validar qualidade
  const validQualities: VideoQuality[] = ['best', '1080', '720', '480', '360'];
  const selectedQuality = validQualities.includes(quality as VideoQuality)
    ? (quality as VideoQuality)
    : '720';

  // Nome do arquivo
  const outputFilename = typeof filename === 'string' && filename
    ? filename
    : `video_${videoIdExtracted || 'download'}.mp4`;

  console.log(`[Download] Iniciando: ${videoUrl} @ ${selectedQuality}`);

  // Flag para detectar se cliente desconectou
  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
    console.log('[Download] Cliente desconectou');
  });

  try {
    // Baixar para arquivo temporario (necessario para merge video+audio)
    const result = await downloadVideoToFile(
      videoUrl,
      { quality: selectedQuality, filename: outputFilename },
      (progress) => {
        console.log(`[Download] Progresso: ${progress}%`);
      }
    );

    // Se cliente desconectou durante download, limpar e sair
    if (clientDisconnected) {
      console.log('[Download] Cancelado - cliente desconectou');
      await result.cleanup();
      return;
    }

    console.log(`[Download] Arquivo pronto: ${result.fileSize} bytes`);

    // Headers para download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.setHeader('Content-Length', result.fileSize.toString());

    // Stream do arquivo para o cliente
    const fileStream = result.createStream();

    fileStream.on('end', async () => {
      console.log(`[Download] Concluido: ${videoUrl}`);
      await result.cleanup();
    });

    fileStream.on('error', async (error) => {
      console.error('[Download] Erro ao ler arquivo:', error);
      await result.cleanup();
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao enviar arquivo' });
      }
    });

    // Se cliente desconectar durante streaming, limpar
    req.on('close', async () => {
      if (!fileStream.destroyed) {
        fileStream.destroy();
      }
      await result.cleanup();
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('[Download] Erro:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao baixar video',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
});

// ========== GET /api/formats ==========
// Lista formatos disponiveis para um video

router.get('/formats', async (req: Request, res: Response) => {
  const { url, videoId } = req.query;

  let videoUrl: string;

  if (url && typeof url === 'string') {
    if (!isValidYouTubeUrl(url)) {
      res.status(400).json({ error: 'URL do YouTube invalida' });
      return;
    }
    videoUrl = url;
  } else if (videoId && typeof videoId === 'string') {
    videoUrl = buildYouTubeUrl(videoId);
  } else {
    res.status(400).json({ error: 'Parametro url ou videoId e obrigatorio' });
    return;
  }

  try {
    const info = await getVideoInfo(videoUrl);
    res.json({
      videoId: info.id,
      title: info.title,
      formats: info.formats,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter formatos',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

export default router;
