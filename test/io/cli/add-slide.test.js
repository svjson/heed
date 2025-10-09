import path from 'path';

import { expect } from '@playwright/test';

import { heedCli } from './cli-runner.js';
import { createPresentationDotJson } from '../../../lib/presentation.js';
import { createSlide } from '../../../lib/slide.js';
import { test, tree } from '../../fixture.js';

test.describe('$ heed-cli add slide', () => {
  test.describe('(in empty dir) heed-cli add slide', () => {
    test('heed-cli add slide', async ({ tmpDir }) => {
      // When
      const result = await heedCli(['add', 'slide'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toContain('No presentation.json found');
      expect(stdout).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([]);
    });

    test('heed-cli add slide --json', async ({ tmpDir }) => {
      // When
      const result = await heedCli(['add', 'slide', '--json'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toEqual('');
      expect(JSON.parse(stdout)).toMatchObject({
        error: expect.stringContaining('No presentation.json found'),
      });
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([]);
    });
  });

  test.describe('(in new presentation root-dir) heed-cli add slide', () => {
    test('heed-cli add slide', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'slide'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toContain('Slide ID not specified');
      expect(stdout).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed']],
      ]);
    });

    test('heed-cli add slide --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'slide', '--json'], { cwd: tmpDir });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(1);
      expect(stderr).toEqual('');
      expect(JSON.parse(stdout)).toMatchObject({
        error: expect.stringContaining('Slide ID not specified'),
      });
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed']],
      ]);
    });
  });

  test.describe('(in new presentation root-dir) heed-cli add slide awesome-eels', () => {
    test('heed-cli add slide awesome-eels', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'slide', 'awesome-eels'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stdout).toContain('created slide');
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed', 'front_01-awesome-eels.heed']],
      ]);
    });

    test('heed-cli add slide awesome-eels --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });

      // When
      const result = await heedCli(['add', 'slide', 'awesome-eels', '--json'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stderr).toEqual('');
      expect(JSON.parse(stdout)).toMatchObject({
        message: expect.stringContaining('created slide'),
      });
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        ['slides', ['front.heed', 'front_01-awesome-eels.heed']],
      ]);
    });
  });

  test.describe('heed-cli add slide hugging-an-eel', () => {
    test('heed-cli add slide hugging-an-eel', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await createSlide(
        path.join(tmpDir, 'slides', 'front_01-awesome-eels.heed'),
        { title: 'Eels are so awesome!' },
      );

      // When
      const result = await heedCli(['add', 'slide', 'hugging-an-eel'], {
        cwd: tmpDir,
      });

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stdout).toContain('created slide');
      expect(stderr).toEqual('');
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'slides',
          [
            'front.heed',
            'front_01-awesome-eels.heed',
            'front_02-hugging-an-eel.heed',
          ],
        ],
      ]);
    });

    test('heed-cli add slide hugging-an-eel --json', async ({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'My Presentation About Eels');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), {
        title: 'All About Eels',
      });
      await createSlide(
        path.join(tmpDir, 'slides', 'front_01-awesome-eels.heed'),
        { title: 'Eels are so awesome!' },
      );

      // When
      const result = await heedCli(
        ['add', 'slide', 'hugging-an-eel', '--json'],
        {
          cwd: tmpDir,
        },
      );

      // Then
      const { code, stdout, stderr, error } = result;
      expect(code).toBe(0);
      expect(stderr).toEqual('');
      expect(JSON.parse(stdout)).toMatchObject({
        message: expect.stringContaining('created slide'),
      });
      expect(error).toBeUndefined();
      expect(await tree(tmpDir)).toEqual([
        'presentation.json',
        [
          'slides',
          [
            'front.heed',
            'front_01-awesome-eels.heed',
            'front_02-hugging-an-eel.heed',
          ],
        ],
      ]);
    });
  });
});
