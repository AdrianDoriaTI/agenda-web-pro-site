// Gera dist/_redirects depois do build: /site sozinho ainda não tem página e leva ao único segmento.
// Fica na raiz do dist (fora do outDir do Astro), onde o Worker de arquivos estáticos lê o arquivo.
import { writeFileSync } from 'node:fs';

writeFileSync('dist/_redirects', ['/site /site/barbearias/ 302', '/site/ /site/barbearias/ 302', ''].join('\n'));
