import fs from 'node:fs/promises';
import path from 'node:path';

import { expect } from '@playwright/test';

import { heedCli } from './cli-runner.js';
import { createPresentationDotJson } from '../../../lib/presentation.js';
import { createSlide } from '../../../lib/slide.js';
import { test, tree } from '../../fixture.js';

test.describe('$ heed-cli add section', () => {
  test.describe('(in empty dir)', () => {
    test('heed-cli add section', async ({ tmpDir }) => {
      // When
      const result = await heedCli(['add', 'section'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toContain('No presentation.json found');
      expect(stdout).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([]);
    });
  });

  test.describe('(in new presentation root-dir)', () => {
    test('heed-cli add section', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'section'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toContain('Section ID not specified');
      expect(stdout).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'section', '--json'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toEqual('');
      expect(JSON.parse(stdout)).toMatchObject({
        error: expect.stringContaining('Section ID not specified'),
      });
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section intro', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'section', 'intro'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stdout).toContain('Successfully created section 01-intro');
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['sections', [['01-intro', []]]],
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section intro --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'section', 'intro', '--json'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(JSON.parse(stdout)).toMatchObject({
        message: expect.stringContaining(
          'Successfully created section 01-intro',
        ),
      });
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['sections', [['01-intro', []]]],
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section green-eels', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await fs.mkdir(path.join(tmpDir, 'sections', '01-intro'), {
        recursive: true,
      });

      // When
      const result = await heedCli(['add', 'section', 'green-eels'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stdout).toContain('Successfully created section 02-green-eels');
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'sections',
          [
            ['01-intro', []],
            ['02-green-eels', []],
          ],
        ],
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section green-eels --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await fs.mkdir(path.join(tmpDir, 'sections', '01-intro'), {
        recursive: true,
      });

      // When
      const result = await heedCli(['add', 'section', 'green-eels', '--json'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(JSON.parse(stdout)).toMatchObject({
        message: expect.stringContaining(
          'Successfully created section 02-green-eels',
        ),
      });
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'sections',
          [
            ['01-intro', []],
            ['02-green-eels', []],
          ],
        ],
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section intro-to-intro', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await fs.mkdir(path.join(tmpDir, 'sections', '01-intro'), {
        recursive: true,
      });

      // When
      const result = await heedCli(
        ['add', 'section', 'intro-to-intro', './sections/01-intro'],
        {
          cwd: tmpDir,
        },
      );

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stdout).toContain(
        'Successfully created section 01-intro-to-intro',
      );
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'sections',
          [['01-intro', [['sections', [['01-intro-to-intro', []]]]]]],
        ],
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add section intro-to-intro --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await fs.mkdir(path.join(tmpDir, 'sections', '01-intro'), {
        recursive: true,
      });

      // When
      const result = await heedCli(
        ['add', 'section', 'intro-to-intro', './sections/01-intro', '--json'],
        {
          cwd: tmpDir,
        },
      );

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(JSON.parse(stdout)).toMatchObject({
        message: expect.stringContaining(
          'Successfully created section 01-intro-to-intro',
        ),
      });
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'sections',
          [['01-intro', [['sections', [['01-intro-to-intro', []]]]]]],
        ],
        ['slides', ['front.heed']],
      ]);
    });
  });
});
