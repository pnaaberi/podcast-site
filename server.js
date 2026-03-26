const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3370;
const ROOT = __dirname;
const STATS_FILE = path.join(ROOT, 'data', 'analytics.json');
const STATS_SECRET = process.env.PODCAST_STATS_KEY || 'changeme';

// Ensure data directory exists
const dataDir = path.join(ROOT, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.srt': 'text/plain',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

// ── Analytics: Aggregate Counters (no PII, no cookies) ──

// In-memory aggregates, flushed to disk periodically
let analytics = loadAnalytics();
let dirty = false;

function loadAnalytics() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('[podcast-site] Failed to load analytics:', e.message);
  }
  return { days: {}, referrers: {}, viewports: {}, totalEvents: 0 };
}

function flushAnalytics() {
  if (!dirty) return;
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(analytics, null, 2));
    dirty = false;
  } catch (e) {
    console.warn('[podcast-site] Failed to flush analytics:', e.message);
  }
}

// Flush every 60 seconds
setInterval(flushAnalytics, 60_000);
process.on('SIGINT', () => { flushAnalytics(); process.exit(0); });
process.on('SIGTERM', () => { flushAnalytics(); process.exit(0); });

function recordEvent(event, epNum, referrer, viewport) {
  const today = new Date().toISOString().slice(0, 10);

  // Daily counters
  if (!analytics.days[today]) analytics.days[today] = {};
  const day = analytics.days[today];

  // Event type counters
  const key = epNum != null ? `${event}:${epNum}` : event;
  day[key] = (day[key] || 0) + 1;

  // Referrer domain (first 50 chars, sanitized)
  if (referrer && referrer !== 'direct') {
    try {
      const domain = new URL(referrer).hostname.slice(0, 50);
      if (domain) {
        if (!analytics.referrers[today]) analytics.referrers[today] = {};
        analytics.referrers[today][domain] = (analytics.referrers[today][domain] || 0) + 1;
      }
    } catch (e) { /* invalid URL, skip */ }
  }

  // Viewport bucket
  if (viewport) {
    const bucket = viewport <= 480 ? 'mobile' : viewport <= 1024 ? 'tablet' : 'desktop';
    if (!analytics.viewports[today]) analytics.viewports[today] = {};
    analytics.viewports[today][bucket] = (analytics.viewports[today][bucket] || 0) + 1;
  }

  analytics.totalEvents = (analytics.totalEvents || 0) + 1;
  dirty = true;
}

// ── Rate Limiting (in-memory, per IP) ──

const rateLimits = new Map(); // IP → { count, resetAt }
const RATE_LIMIT_EVENTS = 20;  // events per minute
const RATE_LIMIT_AUDIO = 30;   // audio requests per minute
const RATE_WINDOW = 60_000;    // 1 minute

function isRateLimited(ip, type = 'event') {
  const key = `${type}:${ip}`;
  const now = Date.now();
  const limit = type === 'audio' ? RATE_LIMIT_AUDIO : RATE_LIMIT_EVENTS;

  let entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimits.set(key, entry);
  }
  entry.count++;
  return entry.count > limit;
}

// Clean up rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}, 300_000);

// ── Allowed Origins for Embeds ──

const ALLOWED_FRAME_ANCESTORS = [
  'https://pnaaberi.github.io',
  'https://choppymini.tail85ce31.ts.net',
  'http://localhost:3370',
];

// ── HTTP Server ──

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress || '';

  // ── API: Event Beacon ──
  if (req.url === '/api/event' && req.method === 'POST') {
    if (isRateLimited(ip, 'event')) {
      res.writeHead(429);
      return res.end('Rate limited');
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024) { req.destroy(); return; } // Max 1KB
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const event = String(data.event || '').slice(0, 20);
        const epNum = data.epNum != null ? parseInt(data.epNum, 10) : null;
        const referrer = String(data.referrer || 'direct').slice(0, 200);
        const viewport = data.viewport != null ? parseInt(data.viewport, 10) : null;

        // Validate event type
        const validEvents = ['pageview', 'play', 'complete', 'notes', 'captions', 'share', 'embed'];
        if (!validEvents.includes(event)) {
          res.writeHead(400);
          return res.end('Invalid event');
        }

        recordEvent(event, epNum, referrer, viewport);
        res.writeHead(204);
        res.end();
      } catch (e) {
        res.writeHead(400);
        res.end('Bad request');
      }
    });
    return;
  }

  // ── API: Stats (auth required) ──
  if (req.url.startsWith('/api/stats')) {
    const params = new URL(req.url, 'http://localhost').searchParams;
    if (params.get('key') !== STATS_SECRET) {
      res.writeHead(401);
      return res.end('Unauthorized');
    }

    // Optional: last N days
    const lastDays = parseInt(params.get('days') || '30', 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lastDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const filteredDays = {};
    for (const [date, data] of Object.entries(analytics.days)) {
      if (date >= cutoffStr) filteredDays[date] = data;
    }

    const filteredReferrers = {};
    for (const [date, data] of Object.entries(analytics.referrers || {})) {
      if (date >= cutoffStr) filteredReferrers[date] = data;
    }

    const filteredViewports = {};
    for (const [date, data] of Object.entries(analytics.viewports || {})) {
      if (date >= cutoffStr) filteredViewports[date] = data;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      days: filteredDays,
      referrers: filteredReferrers,
      viewports: filteredViewports,
      totalEvents: analytics.totalEvents,
      period: `last ${lastDays} days`,
    }, null, 2));
    return;
  }

  // ── Static File Serving ──

  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';

  // Security: block dotfiles, sensitive paths, and internal dirs
  const BLOCKED_PATTERNS = [
    /\/\./,                    // any dotfile/dotdir (/.git/, /.env, /.gitignore)
    /^\/server\.js$/,          // source code
    /^\/package\.json$/,       // package manifest
    /^\/node_modules/,         // dependencies
    /^\/data\//,               // analytics data
    /^\/memory\//,             // if exists
  ];
  if (BLOCKED_PATTERNS.some(p => p.test(url))) {
    res.writeHead(404);
    return res.end('Not found');
  }

  // Security: allowlist servable paths
  const ALLOWED_PREFIXES = [
    '/index.html', '/episode.html', '/embed.html',
    '/episodes.json', '/feed.xml', '/sitemap.xml', '/robots.txt',
    '/llms.txt', '/llms-full.txt', '/og-image.png',
    '/audio/', '/notes/', '/transcripts/', '/subtitles/',
  ];
  if (!ALLOWED_PREFIXES.some(p => url === p || url.startsWith(p))) {
    res.writeHead(404);
    return res.end('Not found');
  }

  const filePath = path.join(ROOT, url);

  // Security: no path traversal (belt + suspenders)
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Frame control — only embed.html is frameable, and only from allowed origins
  if (url === '/embed.html') {
    res.setHeader('Content-Security-Policy', `frame-ancestors ${ALLOWED_FRAME_ANCESTORS.join(' ')}`);
  } else {
    res.setHeader('X-Frame-Options', 'DENY');
  }

  // Cache control for static assets
  const ext = path.extname(decodeURIComponent(url)).toLowerCase();
  if (['.mp3', '.ogg', '.png', '.jpg', '.svg'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  } else if (['.html', '.json', '.xml'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min
  }

  // Audio rate limiting
  if (ext === '.mp3' || ext === '.ogg') {
    if (isRateLimited(ip, 'audio')) {
      res.writeHead(429);
      return res.end('Rate limited');
    }
    // Log audio request (for RSS/podcast app tracking)
    const referer = req.headers.referer || req.headers.referrer || 'direct';
    const ua = (req.headers['user-agent'] || '').slice(0, 80);
    console.log(`[audio] ${new Date().toISOString()} ${path.basename(filePath)} ref=${referer.slice(0, 60)} ua=${ua}`);
  }

  // Try file, then file/index.html
  const tryPaths = [filePath];
  if (!path.extname(filePath)) tryPaths.push(path.join(filePath, 'index.html'));

  for (const p of tryPaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const ext = path.extname(p).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';

      // Stream large files (audio)
      if (ext === '.mp3' || ext === '.ogg') {
        const stat = fs.statSync(p);
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mime,
          });
          return fs.createReadStream(p, { start, end }).pipe(res);
        }
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': mime,
          'Accept-Ranges': 'bytes',
        });
        return fs.createReadStream(p).pipe(res);
      }

      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(p).pipe(res);
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[podcast-site] listening on http://127.0.0.1:${PORT}`);
});
