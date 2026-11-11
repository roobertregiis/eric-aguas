import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CSP só no build (o dev server precisa de scripts inline do HMR)
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
const cspBuild = {
  name: 'csp-build',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
};

// base relativa: funciona em GitHub Pages e em domínio próprio
export default defineConfig({ plugins: [react(), cspBuild], base: './', build: { sourcemap: false } });
