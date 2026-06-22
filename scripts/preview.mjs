// Local static server for the built `dist/` directory.
// Emulates GitHub Pages: missing paths fall back to /404.html with a 404 status,
// so the /games SPA deep-link redirect can be tested locally.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 4178;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(root, urlPath);
    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
        return res.end(fs.readFileSync(file));
      }
    } catch {
      /* fall through to 404 */
    }
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(root, '404.html')));
  })
  .listen(port, () => {
    console.log(`Serving dist/ at http://localhost:${port}`);
  });
