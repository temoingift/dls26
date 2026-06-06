import fs from "fs/promises";
import path from "path";
import serverModule from "../dist/server/server.js";
const server = serverModule?.default ?? serverModule;

export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url, `${proto}://${host}`);

    // Serve static assets directly from any common build location when present
    const pathname = url.pathname || '/';
    if (
      pathname === '/favicon.ico' ||
      pathname === '/manifest.webmanifest' ||
      pathname.startsWith('/assets/')
    ) {
      // candidate locations (in priority order)
      const candidates = [];
      const rel = pathname.replace(/^\//, '');
      // .vercel/output/static/<rel>
      candidates.push(path.join(process.cwd(), '.vercel', 'output', 'static', rel));
      // public/<rel>
      candidates.push(path.join(process.cwd(), 'public', rel));
      // dist/client/<rel>
      candidates.push(path.join(process.cwd(), 'dist', 'client', rel));
      // dist/server/<rel or assets/...>
      if (pathname.startsWith('/assets/')) {
        candidates.push(path.join(process.cwd(), 'dist', 'server', 'assets', pathname.replace(/^\/assets\//, '')));
      } else {
        candidates.push(path.join(process.cwd(), 'dist', 'server', rel));
      }

      for (const filePath of candidates) {
        try {
          const data = await fs.readFile(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mime = (
            ext === '.css' ? 'text/css; charset=utf-8' :
            ext === '.js' ? 'application/javascript; charset=utf-8' :
            ext === '.json' ? 'application/json' :
            ext === '.png' ? 'image/png' :
            ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
            ext === '.svg' ? 'image/svg+xml' :
            ext === '.ico' ? 'image/x-icon' :
            ext === '.webmanifest' ? 'application/manifest+json' :
            'application/octet-stream'
          );
          res.statusCode = 200;
          res.setHeader('content-type', mime);
          return res.end(data);
        } catch (err) {
          // try next candidate
        }
      }
      // fall through to server.fetch if none found
    }

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (v === undefined) continue;
      if (Array.isArray(v)) {
        for (const vv of v) headers.append(k, String(vv));
      } else {
        headers.set(k, String(v));
      }
    }

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const response = await server.fetch(request, undefined, undefined);

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Edge handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
