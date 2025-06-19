import fs from 'fs';
import { readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { test as pwTest, expect } from '@playwright/test';

import { parseFrontmatter } from '../lib/heed-file';

/**
 * Read test asset into a string
 */
export const readAsset = async (meta, relativePath) => {
  return await readFile(path.resolve(path.dirname(fileURLToPath(meta)), relativePath), 'utf-8');
};

/**
 * Extend Playwright by adding a fixture that sets up a temporary directory
 * for tests requiring `tmpDir` and removes it after the tests are completed.
 */
export const test = pwTest.extend({
  tmpDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'heed-cli-'));
    await use(dir);
    await rm(dir, { recursive: true, force: true });
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
