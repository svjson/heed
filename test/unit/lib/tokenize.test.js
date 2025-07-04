// @ts-check
import { test, expect } from '@playwright/test';

import accumulateFromAsideContentCase from './case/accumulate-from-aside-content.case.js';
import codeBlockCase from './case/code-block.case.js';
import columnLayoutBlockCase from './case/column-layout-block.case.js';
import columnLayoutImplicitColumnsCase from './case/column-layout-implicit-columns.case.js';
import forMacroBlockWithRangeCase from './case/for-macro-block-with-range.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import linearTextAccumulationCase from './case/linear-text-accumulation.case.js';
import revealFrontmatterMacroCase from './case/reveal-frontmatter-macro.case.js';
import textBlockCase from './case/single-text-block.case.js';
import slideWithNotesAsideBlockCase from './case/slide-with-notes-aside-block.case.js';
import { tokenize } from '../../../lib/tokenize.js';

test.describe('tokenize() - content blocks', () => {

  [
    accumulateFromAsideContentCase,
    codeBlockCase,
    columnLayoutBlockCase,
    columnLayoutImplicitColumnsCase,
    forMacroBlockCase,
    forMacroBlockWithRangeCase,
    linearTextAccumulationCase,
    revealFrontmatterMacroCase,
    slideWithNotesAsideBlockCase,
    textBlockCase
  ] .forEach(testCase => {
    test(`tokenize a ${testCase.tokenizeDescription ?? testCase.description}`, () => {
      // Given
      const fileData = testCase.heedFile;

      // When
      const tokens = tokenize(fileData, 0);

      // Then
      expect(tokens).toEqual(testCase.tokenized);
    });
  });

});
