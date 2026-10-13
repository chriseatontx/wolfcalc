import { createServer as createHttpServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
]);

export function resolveRequestPath(root, requestTarget) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestTarget, 'http://localhost').pathname);
  } catch {
    return null;
  }
  if (pathname === '/') pathname = '/index.html';
  const rootPath = path.resolve(root);
  const filePath = path.resolve(rootPath, `.${pathname}`);
  if (filePath !== rootPath && !filePath.startsWith(`${rootPath}${path.sep}`)) return null;
  return filePath;
}

export function createServer(root = projectRoot) {
  return createHttpServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    const filePath = resolveRequestPath(root, request.url ?? '/');
    if (!filePath || !mimeTypes.has(path.extname(filePath).toLowerCase())) {
      response.writeHead(404).end('Not found');
      return;
    }

    try {
      if (!(await stat(filePath)).isFile()) throw new Error('Not a file');
      const body = await readFile(filePath);
      response.writeHead(200, {
        'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()),
        'Content-Length': body.length,
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      const missing = error?.code === 'ENOENT' || error?.code === 'ENOTDIR' || error?.message === 'Not a file';
      response.writeHead(missing ? 404 : 500).end(missing ? 'Not found' : 'Server error');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8000);
  const host = process.env.HOST ?? '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535.');
  }
  createServer().listen(port, host, () => {
    process.stdout.write(`calc.wolfcreek is available at http://${host}:${port}/\n`);
  });
}
