// @ts-check
import { test, expect } from '@playwright/test';
import { tokenize } from '../../../lib/tokenize.js';

import { readAsset } from '../../fixture.js';

test.describe('tokenize() - content blocks', () => {

  test('tokenize a single text block', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/single-text-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { type: 'blockStart', blockType: 'text', depth: 0, attrText: '{ id=main-text }', line: 0},
      { type: 'attr', key: 'style', value: 'color: red;', depth: 0, line: 1 },
      { type: 'content', value: "I have a song.", depth: 0, line: 2 },
      { type: 'content', value: "It's really, really good.", depth: 0, line: 3 },
      { type: 'content', value: "I have to sing it twice.", depth: 0, line: 4 },
      { type: 'content', value: "It's understood.", depth: 0, line: 5 },
      { type: 'blockEnd', depth: 0, line: 6, data: '--'}
    ]);
  });

  test('tokenize a block with content containing empty lines', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/code-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { type: 'blockStart', blockType: 'prism:code-block', depth: 0, attrText: '{ lang=clojure }', line: 0},
      { type: 'attr', key: 'style', value: 'font-size: 40px', depth: 0, line: 1 },
      { type: 'content', value: '(defn evens [xs] (filter even? xs))', depth: 0, line: 2 },
      { type: 'blank', depth: 0, line: 3 },
      { type: 'content', value: '(->> (range) evens (take 10)) ;=> (0 2 4 6 8 10 12 14 16 18)', depth: 0, line: 4 },
      { type: 'blockEnd', depth: 0, line: 5, data: '--'}
    ]);
  });

  test('tokenize a %for-macro block', async () => {
    const fileData = await readAsset(import.meta.url, './assets/for-macro-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 1, type: 'macroBlockStart', blockType: 'for', depth: 0, attrText: '{ %type=image id=block{n} }' },
      { line: 2, type: 'macroAttr', key: 'each', depth: 0, value: 'n' },
      { line: 3, type: 'macroAttr', key: 'values', depth: 0, value: '1,2,3' },
      { line: 4, type: 'attr', key: 'source', depth: 0, value: 'image{n}.png' },
      { line: 5, type: 'attr', key: 'style', depth: 0, value: 'opacity: 1;' },
      { line: 6, type: 'blockEnd', depth: 0, data: '--' }
    ]);

  });

});
