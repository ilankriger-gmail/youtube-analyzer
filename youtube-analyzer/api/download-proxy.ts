import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy endpoint to download video from Cobalt tunnel URL.
 * Bypasses CORS restrictions by fetching server-side and streaming to client.
 * 
 * Vercel Pro allows up to 300s execution and larger responses.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, filename } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      signal: AbortSignal.timeout(120000), // 2 min timeout
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const finalFilename = (typeof filename === 'string' && filename) || `download_${Date.now()}.mp4`;

    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFilename)}"`);

    // Stream the response
    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: 'No response body' });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Download failed' });
    }
  }
}
