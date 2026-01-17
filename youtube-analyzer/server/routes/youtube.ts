// ========== ROTAS PROXY YOUTUBE API ==========

import { Router } from 'express';
import axios from 'axios';

const router = Router();

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

// Log para debug
console.log('YouTube API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

/**
 * Configuração do axios para YouTube API
 * Servidor backend não envia Referer - API Key precisa estar sem restrição HTTP
 */
const youtubeAxios = axios.create({
  baseURL: YOUTUBE_API_BASE,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Proxy para API do YouTube - evita problema de referrer
 */

// GET /api/youtube/channels
router.get('/channels', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API Key not configured' });
    }
    const response = await youtubeAxios.get('/channels', {
      params: {
        ...req.query,
        key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// GET /api/youtube/playlistItems
router.get('/playlistItems', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API Key not configured' });
    }
    const response = await youtubeAxios.get('/playlistItems', {
      params: {
        ...req.query,
        key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// GET /api/youtube/videos
router.get('/videos', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API Key not configured' });
    }
    const response = await youtubeAxios.get('/videos', {
      params: {
        ...req.query,
        key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

export default router;
