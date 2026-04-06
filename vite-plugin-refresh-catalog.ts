/**
 * Dev-only: POST /api/refresh-catalog streams stdout/stderr from `scripts/fetch-netflix-content.js`.
 * Ends with `\n__IMPORT_EXIT__ <code>\n` for the client to parse the exit status.
 */

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

function safeEnd(res: ServerResponse) {
  if (!res.writableEnded) {
    res.end();
  }
}

export function refreshCatalogPlugin(): Plugin {
  return {
    name: 'refresh-catalog-api',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const pathname = req.url?.split('?')[0] ?? '';
        if (pathname !== '/api/refresh-catalog' || req.method !== 'POST') {
          next();
          return;
        }

        const script = path.join(root, 'scripts/fetch-netflix-content.js');
        const child = spawn(process.execPath, [script], {
          cwd: root,
          env: { ...process.env },
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        req.on('close', () => {
          if (!child.killed) {
            child.kill('SIGTERM');
          }
        });

        child.stdout?.on('data', (d: Buffer) => {
          if (!res.writableEnded) {
            res.write(d);
          }
        });

        child.stderr?.on('data', (d: Buffer) => {
          if (!res.writableEnded) {
            res.write(Buffer.from('[stderr] ', 'utf8'));
            res.write(d);
          }
        });

        child.on('error', (err) => {
          if (res.writableEnded) return;
          res.write(`\nFailed to start import: ${err.message}\n__IMPORT_EXIT__ 1\n`);
          safeEnd(res);
        });

        child.on('close', (code) => {
          if (res.writableEnded) return;
          const exitCode = code ?? 1;
          res.write(`\n__IMPORT_EXIT__ ${exitCode}\n`);
          safeEnd(res);
        });
      });
    },
  };
}
