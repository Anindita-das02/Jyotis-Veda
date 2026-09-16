import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function liveEnvPlugin() {
  return {
    name: 'live-env-plugin',
    transformIndexHtml(html: string) {
      try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf-8');
          const match = envContent.match(/^\s*VITE_API_BASE_URL\s*=\s*([^\r\n#]+)/m);
          const url = match ? match[1].trim() : '';
          if (url) {
            return html.replace(
              '<head>',
              `<head>\n    <script>window.__VITE_API_BASE_URL__ = ${JSON.stringify(url)};</script>`
            );
          }
        }
      } catch (e) {
        console.error('Error in liveEnvPlugin:', e);
      }
      return html;
    },
    configureServer(server: any) {
      const envPath = path.resolve(__dirname, '.env');
      server.watcher.add(envPath);
      server.watcher.on('change', (file: string) => {
        if (file.endsWith('.env')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), liveEnvPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
