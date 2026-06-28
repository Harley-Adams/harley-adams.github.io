// Dev server: builds the site, serves dist/ (emulating GitHub Pages 404 handling),
// watches the Markdown/template/style sources, rebuilds on change, and live-reloads
// any open browser tab over Server-Sent Events.
//
// Run with `npm run dev`. For a plain static server without watching, use `npm run preview`.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
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

// Injected into every served HTML page; reconnects automatically and reloads on rebuild.
const liveReloadSnippet = `<script>
  (function () {
    var es = new EventSource('/__livereload');
    es.onmessage = function (e) { if (e.data === 'reload') location.reload(); };
  })();
</script>`;

function build() {
  try {
    execFileSync('node', ['build.mjs'], { cwd: root, stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Build failed:', err.message);
    return false;
  }
}

// Open SSE connections; notified to reload after each successful rebuild.
const clients = new Set();

function notifyReload() {
  for (const res of clients) res.write('data: reload\n\n');
}

// Debounce rapid successive file events into a single rebuild.
let pending = null;
function scheduleRebuild() {
  clearTimeout(pending);
  pending = setTimeout(() => {
    console.log('Change detected — rebuilding…');
    if (build()) notifyReload();
  }, 250);
}

function watch(target, options) {
  if (!fs.existsSync(target)) return;
  fs.watch(target, options, () => scheduleRebuild());
}

build();

// Watch the source inputs that feed build.mjs.
watch(path.join(root, 'cv.md'));
watch(path.join(root, 'press.md'));
watch(path.join(root, 'posts'), { recursive: true });
watch(path.join(root, 'src'), { recursive: true });

http
  .createServer((req, res) => {
    if (req.url === '/__livereload') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });
      res.write('retry: 1000\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(dist, urlPath);
    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const type = types[path.extname(file)] || 'application/octet-stream';
        if (type.startsWith('text/html')) {
          let html = fs.readFileSync(file, 'utf8');
          html = html.includes('</body>')
            ? html.replace('</body>', `${liveReloadSnippet}</body>`)
            : html + liveReloadSnippet;
          res.writeHead(200, { 'content-type': type });
          return res.end(html);
        }
        res.writeHead(200, { 'content-type': type });
        return res.end(fs.readFileSync(file));
      }
    } catch {
      /* fall through to 404 */
    }
    let notFound = fs.readFileSync(path.join(dist, '404.html'), 'utf8');
    notFound = notFound.includes('</body>')
      ? notFound.replace('</body>', `${liveReloadSnippet}</body>`)
      : notFound + liveReloadSnippet;
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(notFound);
  })
  .listen(port, () => {
    console.log(`Serving dist/ at http://localhost:${port} (watching for changes)`);
  });
