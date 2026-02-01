// ========== APIFY SERVICE FOR INSTAGRAM SCRAPING ==========
// Replaces Python/Instaloader with Apify actors

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'apify~instagram-post-scraper';
const POLL_INTERVAL_MS = 5000;
const MAX_WAIT_MS = 5 * 60 * 1000; // 5 minutes

function getApiKey() {
  const key = process.env.APIFY_API_KEY;
  if (!key) throw new Error('APIFY_API_KEY not configured');
  return key;
}

/**
 * Start an Apify actor run for Instagram post scraping
 */
async function startRun(username, maxPosts = 100) {
  const apiKey = getApiKey();
  
  const res = await fetch(`${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: [username],
      resultsLimit: maxPosts,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify start run failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return { runId: data.data.id };
}

/**
 * Poll Apify run until completion
 */
async function waitForRun(runId) {
  const apiKey = getApiKey();
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${apiKey}`);
    if (!res.ok) throw new Error(`Apify poll failed: ${res.status}`);

    const data = await res.json();
    const status = data.data.status;

    if (status === 'SUCCEEDED') {
      return data.data.defaultDatasetId;
    }
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ${status}: ${data.data.statusMessage || 'no details'}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error('Apify run timed out waiting for completion');
}

/**
 * Fetch dataset items from a completed run
 */
async function getDatasetItems(datasetId) {
  const apiKey = getApiKey();
  const res = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?token=${apiKey}`);
  if (!res.ok) throw new Error(`Apify dataset fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Transform Apify Instagram Post Scraper item to our video format
 * 
 * Apify fields (from apify/instagram-post-scraper):
 *   shortCode, caption, commentsCount, likesCount, videoViewCount,
 *   videoPlayCount, videoDuration, displayUrl, videoUrl, timestamp,
 *   type ("Video"|"Image"|"Sidecar"), productType ("clips"|"feed"|etc),
 *   ownerUsername, ownerFullName, ownerId, url
 */
function transformPost(item) {
  const caption = item.caption || '';
  const captionClean = caption.split('\n')[0].slice(0, 100) || 'Sem titulo';

  const isReel = item.productType === 'clips';

  return {
    shortcode: item.shortCode || '',
    thumbnail: item.displayUrl || '',
    caption: captionClean,
    caption_full: caption.slice(0, 500),
    views: item.videoPlayCount || item.videoViewCount || 0,
    likes: item.likesCount || 0,
    comments: item.commentsCount || 0,
    duration: Math.round(item.videoDuration || 0),
    timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : null,
    type: isReel ? 'reel' : 'post',
    url: item.url || `https://www.instagram.com/p/${item.shortCode}/`,
    video_url: item.videoUrl || '',
  };
}

/**
 * Transform Apify items to profile + videos format matching frontend expectations
 */
function transformToProfileData(items, username) {
  // Filter to video posts only (reels + video posts)
  const videos = items
    .filter(item => item.type === 'Video' || item.videoUrl)
    .map(transformPost);

  // Extract profile info from first item's owner data
  const firstItem = items[0];
  const ownerInfo = {
    username: firstItem?.ownerUsername || username,
    full_name: firstItem?.ownerFullName || '',
    profile_pic: '', // Post scraper doesn't return owner profile pic
  };

  return {
    ...ownerInfo,
    followers: 0, // Post scraper doesn't return follower count
    following: 0,
    posts_count: items.length,
    bio: '',
    is_private: false,
    videos,
    fetched_at: new Date().toISOString(),
    logged_in: true,
  };
}

/**
 * Main function: fetch Instagram posts via Apify
 * Returns data in the same format as the old Python script
 */
async function fetchInstagramPosts(username, maxPosts = 100) {
  console.log(`[Apify] Starting run for @${username} (max ${maxPosts} posts)...`);

  const { runId } = await startRun(username, maxPosts);
  console.log(`[Apify] Run started: ${runId}`);

  const datasetId = await waitForRun(runId);
  console.log(`[Apify] Run completed, dataset: ${datasetId}`);

  const items = await getDatasetItems(datasetId);
  console.log(`[Apify] Got ${items.length} items from dataset`);

  if (items.length === 0) {
    return {
      error: 'Apify returned no results. The profile may be private or have no posts.',
      username,
    };
  }

  return transformToProfileData(items, username);
}

/**
 * Fetch comments for a specific post via Apify
 * Uses the Instagram Comment Scraper actor
 */
async function fetchComments(shortcode, limit = 500) {
  const apiKey = getApiKey();
  const COMMENTS_ACTOR = 'apify~instagram-comment-scraper';
  
  console.log(`[Apify] Fetching comments for ${shortcode}...`);
  
  const res = await fetch(`${APIFY_BASE}/acts/${COMMENTS_ACTOR}/runs?token=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/p/${shortcode}/`],
      resultsLimit: limit,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify comments run failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const runId = data.data.id;

  const datasetId = await waitForRun(runId);
  const items = await getDatasetItems(datasetId);

  console.log(`[Apify] Got ${items.length} comments for ${shortcode}`);

  return {
    shortcode,
    comments: items.map(c => ({
      username: c.ownerUsername || c.username || 'unknown',
      text: c.text || '',
      timestamp: c.timestamp || null,
      likes: c.likesCount || 0,
    })),
    fetched_comments: items.length,
  };
}

module.exports = {
  fetchInstagramPosts,
  fetchComments,
  transformPost,
  transformToProfileData,
};
