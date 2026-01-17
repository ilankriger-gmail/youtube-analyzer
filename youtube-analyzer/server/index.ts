// ========== SERVIDOR EXPRESS - DOWNLOAD API ==========

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import downloadRoutes from './routes/download.js';
import tiktokRoutes from './routes/tiktok.js';
import youtubeRoutes from './routes/youtube.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARES ==========

// CORS - permite requisicoes do frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://localhost:5174',
  // URLs de producao (Vercel)
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisicoes sem origin (ex: curl, mobile apps)
    if (!origin) return callback(null, true);
    // Permite qualquer subdominio do Vercel
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Permite origens na lista
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Permite todas por enquanto para facilitar
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON
app.use(express.json());

// Log de requisicoes
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ========== ROTAS ==========

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de download (YouTube)
app.use('/api', downloadRoutes);

// Rotas proxy YouTube API
app.use('/api/youtube', youtubeRoutes);

// Rotas do TikTok
app.use('/api/tiktok', tiktokRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint nao encontrado' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: err.message,
  });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('   Video Analyzer - Download Server     ');
  console.log('========================================');
  console.log('');
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints YouTube:');
  console.log(`  GET  /health              - Health check`);
  console.log(`  GET  /api/check           - Verificar yt-dlp e ffmpeg`);
  console.log(`  GET  /api/info?videoId=   - Info do video`);
  console.log(`  GET  /api/download?videoId=&quality= - Download`);
  console.log(`  GET  /api/formats?videoId= - Formatos disponiveis`);
  console.log('');
  console.log('Endpoints TikTok:');
  console.log(`  POST /api/tiktok/validate - Validar URLs`);
  console.log(`  POST /api/tiktok/profile  - Buscar perfil`);
  console.log(`  GET  /api/tiktok/info?url= - Info do video`);
  console.log(`  GET  /api/tiktok/download?url=&quality= - Download`);
  console.log('');
  console.log('Qualidades: best, 1080, 720, 480, 360, audio');
  console.log('========================================');
  console.log('');
});
