import { expect } from '@playwright/test';
import { test, tree, presentationAt, frontmatterOf } from '../fixture.js';
import path from 'path';

import { heedCli } from './cli-runner.js';

test.describe('heed-cli new', () => {

  test('heed-cli new', async ({ tmpDir }) => {
    // When
    const result = await heedCli(['new'], { cwd: tmpDir });

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(1);
    expect(stderr).toContain('Presentation name not specified.');
    expect(stdout).toEqual('');
    expect(error).toBeUndefined();
    expect(await tree(tmpDir)).toEqual([]);
  });

  test('heed-cli new --json', async ({ tmpDir }) => {
    // When
    const result = await heedCli(['new', '--json'], { cwd: tmpDir });

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(1);
    expect(stderr).toEqual('');
    expect(JSON.parse(stdout)).toEqual({ error: 'Presentation name not specified.'});
    expect(error).toBeUndefined();
    expect(await tree(tmpDir)).toEqual([]);
  });

});

test.describe('heed-cli new cats-are-great', () => {

  test('heed-cli new', async ({ tmpDir }) => {
    // When
    const result = await heedCli(['new', 'cats-are-great'], { cwd: tmpDir });

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(0);
    expect(stderr).toEqual('');
    expect(stdout).toContain('Created presentation at');
    expect(error).toBeUndefined();
    expect(await tree(tmpDir)).toEqual(
      ['presentation.json',
        ['slides', ['front.heed']]]);

    expect(await presentationAt(tmpDir)).toMatchObject({
      name: 'cats-are-great',
      folderLayout: 'numbered-sections'
    })

    expect(await frontmatterOf(`${tmpDir}/slides/front.heed`)).toEqual({
      title: 'cats-are-great',
    })
  });

  test('heed-cli new cats-are-great --json', async ({ tmpDir }) => {
    // When
    const result = await heedCli(['new', 'cats-are-great', '--json'], { cwd: tmpDir });

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(0);
    expect(stderr).toEqual('');
    expect(JSON.parse(stdout)).toEqual({
      message: `Created presentation at ${tmpDir}.`
    });
    expect(error).toBeUndefined();
    expect(await tree(tmpDir)).toEqual(
      ['presentation.json',
        ['slides', ['front.heed']]]);

    expect(await presentationAt(tmpDir)).toMatchObject({
      name: 'cats-are-great',
      folderLayout: 'numbered-sections'
    })

    expect(await frontmatterOf(`${tmpDir}/slides/front.heed`)).toEqual({
      title: 'cats-are-great',
    })
  });

});

test.describe('heed-cli new cats-are-great ./cats-pres', () => {

  test('heed-cli new', async ({ tmpDir }) => {
    // When
    const result = await heedCli(
      ['new', 'cats-are-great', './cats-pres'],
      { cwd: tmpDir }
    );

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(0);
    expect(stderr).toEqual('');
    expect(stdout).toContain(`Created presentation at ${tmpDir}/cats-pres.`);
    expect(error).toBeUndefined();
    expect(await tree(tmpDir)).toEqual(
      [['cats-pres',
        ['presentation.json',
          ['slides', ['front.heed']]]]]);

    expect(await presentationAt(path.join(tmpDir, 'cats-pres')))
      .toMatchObject({
        name: 'cats-are-great',
        folderLayout: 'numbered-sections'
      });

    expect(await frontmatterOf(`${tmpDir}/cats-pres/slides/front.heed`))
      .toEqual({
        title: 'cats-are-great',
      })
  });

  test('heed-cli new cats-are-great ./cats-pres --json', async ({ tmpDir }) => {
    // When
    const result = await heedCli(
      ['new', 'cats-are-great', './cats-pres', '--json'],
      { cwd: tmpDir }
    );

    // Then
    const { code, stdout, stderr, error } = result;
    expect(code).toBe(0);
    expect(stderr).toEqual('');
    expect(JSON.parse(stdout)).toEqual({
      message: `Created presentation at ${tmpDir}/cats-pres.`
    });
    expect(error).toBeUndefined();

    expect(await tree(tmpDir)).toEqual(
      [['cats-pres',
        ['presentation.json',
          ['slides', ['front.heed']]]]]);

    expect(await presentationAt(path.join(tmpDir, 'cats-pres')))
      .toMatchObject({
        name: 'cats-are-great',
        folderLayout: 'numbered-sections'
      });

    expect(await frontmatterOf(`${tmpDir}/cats-pres/slides/front.heed`))
      .toEqual({
        title: 'cats-are-great',
      })
  });

});
