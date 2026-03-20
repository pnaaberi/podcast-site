const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3370;
const ROOT = __dirname;

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

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';

  const filePath = path.join(ROOT, url);

  // Security: no path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
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
