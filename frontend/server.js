import express from 'express';
import fs from 'fs';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

const app = express();
const port = Number(process.env.PORT || 80);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const apiBaseUrl = process.env.API_BASE_URL || '/api';
const backendInternalUrl = process.env.BACKEND_INTERNAL_URL || 'http://backend:3000';

app.use(
  '/api',
  createProxyMiddleware({
    target: backendInternalUrl,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    on: {
      proxyReq(proxyReq) {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      }
    }
  })
);

app.use(express.static(distDir, { index: false }));

app.get('*', (_req, res) => {
  const html = fs
    .readFileSync(path.join(distDir, 'index.html'), 'utf-8')
    .replace('__API_BASE_URL__', apiBaseUrl);

  res.type('html');
  res.send(html);
});

app.listen(port, () => {
  console.log(`Frontend running on port ${port}`);
});
