import type { VercelRequest, VercelResponse } from '@vercel/node';

const COBALT_INSTANCES = [
  'https://cobalt-api.kwiatekmiki.com',
  'https://cobalt-7.kwiatekmiki.com',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  if (!body?.url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let lastError: string = '';

  for (const instance of COBALT_INSTANCES) {
    // Try up to 2 times per instance (Cloudflare can be flaky)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(`${instance}/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({
            url: body.url,
            downloadMode: body.downloadMode || 'auto',
            videoQuality: body.videoQuality || '1080',
          }),
          signal: AbortSignal.timeout(20000),
        });

        // Cloudflare block returns HTML
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          lastError = `${instance}: Cloudflare block (attempt ${attempt + 1})`;
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          break;
        }

        if (!response.ok) {
          lastError = `${instance}: HTTP ${response.status}`;
          break;
        }

        const data = await response.json();

        if (data.status === 'error') {
          lastError = `${instance}: ${data.error?.code || 'error'}`;
          break;
        }

        return res.status(200).json(data);
      } catch (err) {
        lastError = `${instance}: ${err instanceof Error ? err.message : 'unknown'}`;
        break;
      }
    }
  }

  return res.status(502).json({
    status: 'error',
    error: `All Cobalt instances failed. Last: ${lastError}`,
  });
}
