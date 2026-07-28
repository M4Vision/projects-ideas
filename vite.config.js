import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/checkpoints/**'],
    },
  },
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'raw-checkpoints',
      resolveId(id) {
        if (id.includes('/checkpoints/')) return { id, external: true }
      },
      load(id) {
        if (id.includes('/checkpoints/')) return { code: '', map: null }
      },
      transform(_code, id) {
        if (id.includes('/checkpoints/')) return { code: '', map: null }
      },
      configureServer: {
        order: 'pre',
        handler(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0]
            if (url && url.includes('/checkpoints/')) {
              const filePath = path.join(process.cwd(), url.startsWith('/') ? url.slice(1) : url)
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                res.end(fs.readFileSync(filePath, 'utf-8'))
                return
              }
            }
            next()
          })
        },
      },
    },
  ],
});
