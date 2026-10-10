import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Project Pages live under a subpath: build deploys with GH_BASE=/4a0x1-study-guide-redesign/
const base = process.env.GH_BASE || '/';

export default defineConfig({
  base,
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('zustand')) {
            return 'vendor-state';
          }
          if (id.includes('lucide-react') || id.includes('clsx') || id.includes('canvas-confetti')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'base-public-refs',
      transformIndexHtml(html: string) {
        if (base === '/') return html;
        return html.replaceAll('href="/icons/', `href="${base}icons/`);
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name:             '4A0X1 CDCs Study Guide',
        short_name:       '4A0X1 CDCs',
        description:      '4A0X1 Health Services Management CDC study app — 5-Level and 7-Level',
        theme_color:      '#F6F3EA',
        background_color: '#F6F3EA',
        display:          'standalone',
        orientation:      'portrait',
        scope:            base,
        start_url:        base,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,json,woff,woff2}'],
      },
    }),
  ],
});
