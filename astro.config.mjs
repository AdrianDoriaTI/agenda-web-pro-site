// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Publicado em https://www.agendawebpro.com.br/site/barbearias. O prefixo /site separa os sites de
// demonstração (futuro: /site/clinicas…) dos links do sistema (/cadastro, /<slug>).
// A saída fica em dist/site/barbearias/ para o Worker servir os arquivos já no caminho certo.
export default defineConfig({
  site: 'https://www.agendawebpro.com.br',
  base: '/site/barbearias',
  outDir: './dist/site/barbearias',
  vite: {
    plugins: [tailwindcss()]
  }
});
