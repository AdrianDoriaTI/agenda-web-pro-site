// Gera dist/_headers depois do build: cabeçalhos de segurança para /site/barbearias/*.
// A CSP libera os scripts inline do HTML final pelos seus hashes (sha256), calculados aqui a cada build,
// e o beacon do Web Analytics da Cloudflare (static.cloudflareinsights.com / cloudflareinsights.com).
// Fica na raiz do dist (fora do outDir do Astro), onde o Worker de arquivos estáticos lê o arquivo.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = 'dist/site/barbearias';

function htmls(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) return htmls(p);
    return nome.endsWith('.html') ? [p] : [];
  });
}

const hashes = new Set();
for (const arquivo of htmls(raiz)) {
  const html = readFileSync(arquivo, 'utf8');
  for (const [, attrs, corpo] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || corpo.length === 0) continue;
    if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(corpo, 'utf8').digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const cabecalhos = [
  '/site/barbearias/*',
  `  Content-Security-Policy: ${csp}`,
  '  X-Frame-Options: DENY',
  '  Strict-Transport-Security: max-age=31536000',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  '',
];

writeFileSync('dist/_headers', cabecalhos.join('\n'));
console.log(`_headers: ${hashes.size} script(s) inline com hash`);
