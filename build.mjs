import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const root = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'dist');
const gamesBuildDir = path.join(root, 'web-ui', 'build');

const BRAND = 'Harley Adams';

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

// Render ```mermaid fences as <pre class="mermaid"> so they render client-side.
const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const info = (tokens[idx].info || '').trim();
  if (info === 'mermaid') {
    return `<pre class="mermaid">${escapeHtml(tokens[idx].content)}</pre>\n`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

// Small inline icons (fill follows currentColor).
const icons = {
  location:
    '<svg class="ico" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  email:
    '<svg class="ico" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.4 2L12 12.2 19.6 7H4.4ZM20 8.6l-7.4 5.05a1 1 0 0 1-1.2 0L4 8.6V17h16V8.6Z"/></svg>',
  LinkedIn:
    '<svg class="ico" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9V9Z"/></svg>',
  GitHub:
    '<svg class="ico" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z"/></svg>',
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function handleFromUrl(label, url) {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/^\/+|\/+$/g, '');
    if (label === 'GitHub') return '@' + (p.split('/').pop() || u.hostname);
    return p || u.hostname;
  } catch (_) {
    return url;
  }
}

function collectLinks(data) {
  const links = [];
  if (data.linkedin)
    links.push({ label: 'LinkedIn', url: data.linkedin, handle: handleFromUrl('LinkedIn', data.linkedin) });
  if (data.github)
    links.push({ label: 'GitHub', url: data.github, handle: handleFromUrl('GitHub', data.github) });
  if (Array.isArray(data.links)) {
    for (const l of data.links)
      links.push({ label: l.label, url: l.url, handle: l.handle || handleFromUrl(l.label, l.url) });
  }
  return links;
}

function buildContact(data) {
  const items = [];
  if (data.location) {
    items.push(`<li>${icons.location}<span>${escapeHtml(data.location)}</span></li>`);
  }
  if (data.email) {
    const [user, domain] = String(data.email).split('@');
    const b64 = Buffer.from(String(data.email)).toString('base64');
    const fallback = `${escapeHtml(user)} [at] ${escapeHtml(domain)}`;
    items.push(
      `<li>${icons.email}<span class="cv-email" data-e="${b64}">${fallback}</span></li>`
    );
  }
  for (const link of collectLinks(data)) {
    const icon = icons[link.label] || '';
    const text = escapeHtml(link.handle || link.label);
    items.push(
      `<li>${icon}<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${text}</a></li>`
    );
  }
  return items.join('\n      ');
}

const emailScript = `<script>
  (function () {
    var el = document.querySelector('.cv-email');
    if (!el) return;
    try {
      var e = atob(el.getAttribute('data-e'));
      var a = document.createElement('a');
      a.href = 'mailto:' + e;
      a.textContent = e;
      el.replaceChildren(a);
    } catch (_) {}
  })();
</script>`;

function nav(base, active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  const brand =
    active === 'cv'
      ? ''
      : `<a class="site-nav-brand" href="${base}index.html">${escapeHtml(BRAND)}</a>`;
  return `<nav class="site-nav" aria-label="Primary">
      <div class="site-nav-inner">
        ${brand}
        <div class="site-nav-links">
          <a href="${base}index.html"${cur('cv')}>CV</a>
          <a href="${base}games/index.html"${cur('games')}>Games</a>
          <a href="${base}thoughts/index.html"${cur('thoughts')}>Thoughts</a>
        </div>
      </div>
    </nav>`;
}

function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return { iso: '', human: String(d ?? '') };
  return {
    iso: date.toISOString().slice(0, 10),
    human: String(date.getUTCFullYear()),
  };
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  const chips = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  return `<span class="post-tags">${chips}</span>`;
}

// Read intrinsic PNG dimensions from the IHDR chunk (no dependencies).
function pngSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.length > 24 && buf.toString('ascii', 12, 16) === 'IHDR') {
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
  } catch (_) {}
  return null;
}

function renderCover(data, slug, postsDir) {
  if (!data.cover) return '';
  const alt = escapeHtml(data.coverAlt || data.title || '');
  const dim = pngSize(path.join(postsDir, slug, data.cover));
  const size = dim ? ` width="${dim.w}" height="${dim.h}"` : '';
  return `<figure class="post-cover">
          <img src="${escapeHtml(data.cover)}" alt="${alt}"${size} loading="eager" decoding="async" />
        </figure>`;
}

// Copy a post's sibling asset folder (posts/<slug>/) into its output dir.
function copyPostAssets(postsDir, slug, destDir) {
  const assetDir = path.join(postsDir, slug);
  if (!fs.existsSync(assetDir) || !fs.statSync(assetDir).isDirectory()) return;
  for (const f of fs.readdirSync(assetDir)) {
    const src = path.join(assetDir, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(destDir, f));
  }
}

function renderSocial(data, slug, siteUrl) {
  if (data.cover && siteUrl) {
    const url = escapeHtml(`${siteUrl}/thoughts/${slug}/${data.cover}`);
    return `<meta name="twitter:card" content="summary_large_image" />
    <meta property="og:image" content="${url}" />
    <meta name="twitter:image" content="${url}" />`;
  }
  return '<meta name="twitter:card" content="summary" />';
}

const mermaidScript = `<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
  await mermaid.run({ querySelector: 'pre.mermaid' });
</script>`;

function rightAlignDates(html) {
  const sep = ' \u00b7 ';
  return html.replace(/<(h3|h4)>([\s\S]*?)<\/\1>/g, (m, tag, inner) => {
    const idx = inner.lastIndexOf(sep);
    if (idx === -1) return m;
    const last = inner.slice(idx + sep.length).trim();
    if (!/(?:19|20)\d{2}|present/i.test(last)) return m;
    const left = inner.slice(0, idx);
    return `<${tag} class="entry"><span class="entry-title">${left}</span><span class="entry-date">${last}</span></${tag}>`;
  });
}

function buildCV(styles) {
  const raw = fs.readFileSync(path.join(root, 'cv.md'), 'utf8');
  const { data, content } = matter(raw);

  let bodyHtml = md.render(content);
  // Standalone emphasised lines (e.g. "*2017 - Present*") become muted meta lines.
  bodyHtml = bodyHtml.replace(/<p><em>([\s\S]*?)<\/em><\/p>/g, '<p class="meta">$1</p>');
  // Pull a trailing " · <date>" out of entry headings and right-align it.
  bodyHtml = rightAlignDates(bodyHtml);

  const template = fs.readFileSync(path.join(srcDir, 'template.html'), 'utf8');

  const html = template
    .replaceAll('{{TITLE_TAG}}', `${escapeHtml(data.name)} \u00b7 ${escapeHtml(data.title)}`)
    .replaceAll('{{DESCRIPTION}}', escapeHtml(data.tagline || ''))
    .replaceAll('{{NAME}}', escapeHtml(data.name))
    .replaceAll('{{TITLE}}', escapeHtml(data.title))
    .replaceAll('{{TAGLINE}}', escapeHtml(data.tagline || ''))
    .replaceAll('{{CONTACT}}', buildContact(data))
    .replaceAll('{{NAV}}', nav('', 'cv'))
    .replaceAll('{{STYLES}}', styles)
    .replaceAll('{{CONTENT}}', bodyHtml)
    .replaceAll('{{SCRIPTS}}', emailScript);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log('Built dist/index.html');
}

function buildThoughts(styles, siteUrl) {
  const postsDir = path.join(root, 'posts');
  if (!fs.existsSync(postsDir)) return;

  const postTemplate = fs.readFileSync(path.join(srcDir, 'post.html'), 'utf8');
  const thoughtsTemplate = fs.readFileSync(path.join(srcDir, 'thoughts.html'), 'utf8');

  const posts = [];
  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = matter(raw);
    if (data.draft) continue;
    const slug = path.basename(file, '.md');
    const { iso, human } = formatDate(data.date);
    const sortKey = data.date ? new Date(data.date).getTime() : 0;
    posts.push({ slug, data, content, iso, human, sortKey });
  }
  posts.sort((a, b) => b.sortKey - a.sortKey);

  const base = '../../';
  for (const post of posts) {
    const bodyHtml = md.render(post.content);
    const hasMermaid = bodyHtml.includes('class="mermaid"');
    const canonical = siteUrl
      ? `${siteUrl}/thoughts/${post.slug}/`
      : `thoughts/${post.slug}/`;

    const html = postTemplate
      .replaceAll('{{TITLE_TAG}}', `${escapeHtml(post.data.title)} \u00b7 ${escapeHtml(BRAND)}`)
      .replaceAll('{{DESCRIPTION}}', escapeHtml(post.data.summary || ''))
      .replaceAll('{{CANONICAL}}', escapeHtml(canonical))
      .replaceAll('{{OG_TITLE}}', escapeHtml(post.data.title))
      .replaceAll('{{SOCIAL}}', renderSocial(post.data, post.slug, siteUrl))
      .replaceAll('{{THOUGHTS_HREF}}', `${base}thoughts/index.html`)
      .replaceAll('{{NAV}}', nav(base, 'thoughts'))
      .replaceAll('{{STYLES}}', styles)
      .replaceAll('{{TITLE}}', escapeHtml(post.data.title))
      .replaceAll('{{DATE_ISO}}', post.iso)
      .replaceAll('{{DATE_HUMAN}}', escapeHtml(post.human))
      .replaceAll('{{TAGS}}', renderTags(post.data.tags))
      .replaceAll('{{COVER}}', renderCover(post.data, post.slug, postsDir))
      .replaceAll('{{CONTENT}}', bodyHtml)
      .replaceAll('{{SCRIPTS}}', hasMermaid ? mermaidScript : '');

    const dir = path.join(outDir, 'thoughts', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    copyPostAssets(postsDir, post.slug, dir);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  }

  const items = posts
    .map((post) => {
      const tags =
        Array.isArray(post.data.tags) && post.data.tags.length
          ? `\n          <div class="post-list-tags">${post.data.tags
              .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
              .join('')}</div>`
          : '';
      return `        <li class="post-list-item">
          <p class="post-list-date"><time datetime="${post.iso}">${escapeHtml(post.human)}</time></p>
          <h2 class="post-list-title"><a href="${post.slug}/index.html">${escapeHtml(post.data.title)}</a></h2>
          <p class="post-list-summary">${escapeHtml(post.data.summary || '')}</p>${tags}
        </li>`;
    })
    .join('\n');

  const listHtml = thoughtsTemplate
    .replaceAll('{{TITLE_TAG}}', `Thoughts \u00b7 ${escapeHtml(BRAND)}`)
    .replaceAll('{{DESCRIPTION}}', 'Writing on software engineering, gaming cloud services, and side projects.')
    .replaceAll('{{NAV}}', nav('../', 'thoughts'))
    .replaceAll('{{STYLES}}', styles)
    .replaceAll(
      '{{LIST}}',
      items || '        <li class="post-list-item"><p class="post-list-summary">Nothing here yet.</p></li>'
    );

  const dir = path.join(outDir, 'thoughts');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), listHtml, 'utf8');
  console.log(`Built dist/thoughts/ (${posts.length} post${posts.length === 1 ? '' : 's'})`);
}

// Recursively copy a directory (Node 16+ compatible).
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

// Copy the built React games app into dist/games/.
function copyGames() {
  if (!fs.existsSync(gamesBuildDir)) {
    console.warn('Skipping games: web-ui/build not found. Run "npm run build:games" first.');
    return;
  }
  const dest = path.join(outDir, 'games');
  copyDir(gamesBuildDir, dest);
  console.log('Copied web-ui/build -> dist/games/');
}

// Single-page-app 404 for GitHub Pages: deep links under /games/ are bounced into
// the React app; any other unknown path falls back to the CV home.
function writeRoot404() {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <script>
      (function () {
        var l = window.location;
        var p = l.pathname;
        if (p.indexOf('/games/') === 0 && p !== '/games/') {
          var rest = p.slice('/games/'.length).replace(/&/g, '~and~');
          l.replace(
            l.protocol + '//' + l.host + '/games/?/' + rest +
            (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
            l.hash
          );
        } else {
          l.replace(l.protocol + '//' + l.host + '/');
        }
      })();
    </script>
  </head>
  <body></body>
</html>
`;
  fs.writeFileSync(path.join(outDir, '404.html'), html, 'utf8');
  console.log('Built dist/404.html');
}

function main() {
  const styles = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');

  let siteUrl = '';
  const cnamePath = path.join(root, 'CNAME');
  if (fs.existsSync(cnamePath)) {
    const host = fs.readFileSync(cnamePath, 'utf8').trim();
    if (host) siteUrl = `https://${host}`;
  }

  buildCV(styles);
  buildThoughts(styles, siteUrl);
  copyGames();
  writeRoot404();

  // Copy CNAME if present (for custom-domain GitHub Pages).
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(outDir, 'CNAME'));
  }
}

main();
