// @ts-check
import { test, expect } from '@playwright/test';
import { tokenize } from '../../../lib/tokenize.js';

import { readAsset } from '../../fixture.js';

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
})
