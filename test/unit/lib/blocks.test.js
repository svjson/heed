// @ts-check
import { test, expect } from '@playwright/test';
import { readAsset } from '../../fixture.js';

import { parseBlocks } from '../../../lib/blocks.js';

test.describe('parseBlocks()', () => {

  test('Parse %for-macro block', async () => {
  // Given
  const source = await readAsset(import.meta.url, './assets/for-macro-block.heed');
  const tokens = [
      { line: 1, type: 'macroBlockStart', blockType: 'for', depth: 0, attrText: '{ %type=image id=block{n} }' },
      { line: 2, type: 'macroAttr', key: 'each', depth: 0, value: 'n' },
      { line: 3, type: 'macroAttr', key: 'values', depth: 0, value: '1,2,3' },
      { line: 4, type: 'attr', key: 'source', depth: 0, value: 'image{n}.png' },
      { line: 5, type: 'attr', key: 'style', depth: 0, value: 'opacity: 1;' },
      { line: 6, type: 'blockEnd', depth: 0, data: '--' }
  ];

  // When
  const blocks = parseBlocks(tokens, source);

  // Then
  expect(blocks).toEqual([
    {
      blockType: 'macro',
      type: 'for',
      macroAttributes: {
        type: 'image',
        each: 'n',
        values: '1,2,3'
      },
      attributes: {
        id: 'block{n}',
        source: 'image{n}.png',
        style: 'opacity: 1;'
      },
      content: '',
      children: [],
      depth: 0
    }
  ])
  });

});
