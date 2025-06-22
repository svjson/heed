// @ts-check
import { test, expect } from '@playwright/test';

import columnLayoutBlockCase from './case/column-layout-block.case.js';
import columnLayoutImplicitColumnsCase from './case/column-layout-implicit-columns.case.js';
import forMacroBlockWithRangeCase from './case/for-macro-block-with-range.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import { parseBlocks } from '../../../lib/blocks.js';

test.describe('parseBlocks()', () => {

  [
    forMacroBlockCase,
    forMacroBlockWithRangeCase,
    columnLayoutBlockCase,
    columnLayoutImplicitColumnsCase
  ].forEach(testCase => {
    test(`Parse ${testCase.parseBlocksDescription ?? testCase.description}`, () => {
      // Given
      const source = testCase.heedFile;
      const tokens = testCase.tokenized;

      // When
      const blocks = parseBlocks(tokens, source);

      // Then
      expect(blocks).toEqual(testCase.intermediateBlocks);
    });
  });

});
