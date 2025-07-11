import fs from 'fs';
import { readFile, readdir, rm, stat } from 'fs/promises';
import http from 'http';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import url from 'url';

import { test as pwTest, expect } from '@playwright/test';
import mime from 'mime-types';

import { parseFrontmatter } from '../lib/heed-file';

/**
 * Read test asset into a string
 */
export const readAsset = async (meta, relativePath) => {
  return await readFile(path.resolve(path.dirname(fileURLToPath(meta)), relativePath), 'utf-8');
};

/**
 * Config for static test servers, mapping local folders to base URL.
 */
const staticTestConfig = {
  slideViewer: {
    staticDirs: [
      { urlPrefix: '/js', dir: 'slide-viewer-static/js' },
      { urlPrefix: '/', dir: 'test/io/slide-viewer/test-static' }
    ]
  }
};

/**
 * Create a HTTP Server for test purposes, serving static file contents
 * according to a configuration object.
 *
 * The configuration should contain an array of objects with `urlPrefix`
 * and `dir` properties, where `urlPrefix` is the URL path that
 * matches the request and `dir` is the directory relative to the
 * current working directory where the static files are located.
 *
 * Example configuration:
 * ```js
 * {
 *   staticDirs: [
 *     { urlPrefix: '/js', dir: 'slide-viewer-static/js' },
 *     { urlPrefix: '/', dir: 'test/io/slide-viewer/test-static' }
 *   ]
 * }
 * ```
 *
 * The server will respond with the contents of the requested file
 * if it exists, or return a 404 Not Found response if the file does not
 * exist or the request path does not match any configured `urlPrefix`.
 *
 * @param {Object} config - Configuration object with `staticDirs` array.
 * @return {http.Server} - The created HTTP server.
 */
const createStaticServer = (config) => {
  return http.createServer(async (req, res) => {
    const reqPath = url.parse(req.url).pathname;

    for (const { urlPrefix, dir } of config.staticDirs) {
      if (!reqPath.startsWith(urlPrefix)) continue;

      const relativePath = reqPath.slice(urlPrefix.length).replace(/^\/+/, '');
      const fullPath = path.join(process.cwd(), dir, relativePath);

      try {
        const fStat = await stat(fullPath);
        if (fStat.isFile()) {
          const content = await readFile(fullPath);
          res.writeHead(200, { 'Content-Type': mime.lookup(fullPath) || 'application/octet-stream' });
          res.end(content);
          return;
        }
      } catch {
        continue;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
};

/**
 * Extend Playwright by adding fixtures for common requirements
 */
export const test = pwTest.extend({
  /**
   * Sets up a temporary directory for tests requiring `tmpDir` and removes it
   * after the tests are completed.
   */
  tmpDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'heed-cli-'));
    await use(dir);
    await rm(dir, { recursive: true, force: true });
  },
  /**
   *
   */
  slideViewerStatic: async ({}, use) => {
    const server = createStaticServer(staticTestConfig.slideViewer);
    const port = 3000;
    const baseUrl = `http://localhost:${port}`;
    await new Promise(resolve => server.listen(port, resolve));
    await use(baseUrl);
    await new Promise(resolve => server.close(resolve));
  }
});

/**
 * Return a lispy directory tree representation of the given directory,
 * suitable for assertions.
 */
export async function tree(dir) {
  const result = [];
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      result.push([file, await tree(filePath)]);
    } else {
      result.push(file);
    }
  }

  return result;
}

/**
 * Read the presentation.json from `dir`, no questions asked. No names taken.
 */
export async function presentationAt(dir) {
  try {
    const data = await readFile(path.join(dir, 'presentation.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Get the frontmatter parameters of the file at `filePath` as an object.
 */
export async function frontmatterOf(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseFrontmatter(content).frontmatter;
  } catch {
    return null;
  }
}

/**
 * Assert that the file at `filePath` contains `text`. Somewhere. Anywhere.
 */
export async function expectFileContains(filePath, text) {
  const content = await readFile(filePath, 'utf-8');
  expect(content).toContain(text);
}
