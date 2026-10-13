import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer, resolveRequestPath } from '../scripts/serve.js';

test('static server maps the root to index.html and rejects traversal', () => {
  const root = path.resolve('fixture');
  assert.equal(resolveRequestPath(root, '/'), path.join(root, 'index.html'));
  assert.equal(resolveRequestPath(root, '/%2e%2e%2f..%2foutside.js'), null);
  assert.equal(resolveRequestPath(root, '/%E0%A4%A'), null);
});

test('static server serves the demo and rejects unsupported methods and files', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'calc-wolfcreek-'));
  await mkdir(path.join(root, 'js'));
  await writeFile(path.join(root, 'index.html'), '<main>demo</main>');
  await writeFile(path.join(root, 'js', 'app.js'), 'export {};');
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ version: '1.2.3' }));
  t.after(() => rm(root, { recursive: true, force: true }));

  const server = createServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(await page.text(), '<main>demo</main>');

  const module = await fetch(`${base}/js/app.js`);
  assert.equal(module.status, 200);
  assert.match(module.headers.get('content-type'), /javascript/);
  assert.equal(await module.text(), 'export {};');

  const packageInfo = await fetch(`${base}/package.json`);
  assert.equal(packageInfo.status, 200);
  assert.equal(packageInfo.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.deepEqual(await packageInfo.json(), { version: '1.2.3' });

  const missing = await fetch(`${base}/secret.txt`);
  assert.equal(missing.status, 404);
  const post = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

