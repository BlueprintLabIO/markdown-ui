// @ts-check
import { defineConfig } from 'astro/config';
// Note: In a pnpm workspace, aliases are not required if packages build to dist during dev.
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), svelte(), vue()],
  site: 'https://markdown-ui.yaoke.pro',
  output: 'static',
  // The old docs page was never finished; send its links to the quickstart.
  redirects: { '/docs/getting-started': '/quickstart' },
  vite: {
    ssr: {
      noExternal: ['@markdown-ui/react', '@markdown-ui/svelte', '@markdown-ui/vue', '@markdown-ui/marked-ext', 'marked']
    },
    optimizeDeps: {
      exclude: ['@markdown-ui/react', '@markdown-ui/svelte', '@markdown-ui/vue', '@markdown-ui/marked-ext', '@markdown-ui/mdui-lang']
    },
    plugins: [tailwindcss()]
  }
});
