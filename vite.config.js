import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));
const coins = JSON.parse(readFileSync(resolve(root, 'src/data/coins.json'), 'utf-8'));

export default defineConfig({
  // Relative base so the build works on GitHub Pages (/<repo>/) and any static host
  base: './',
  plugins: [
    // EJS templating for repeated blocks: header, footer, crypto card, coin logo
    ViteEjsPlugin({ coins }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        assets: resolve(root, 'assets.html'),
        assetDetails: resolve(root, 'asset-details.html'),
        profile: resolve(root, 'profile.html'),
      },
    },
  },
});
