// @ts-check
import { test, expect } from '@playwright/test';

import codeBlockCase from './case/code-block.case.js';
import columnLayoutBlockCase from './case/column-layout-block.case.js';
import columnLayoutImplicitColumnsCase from './case/column-layout-implicit-columns.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import textBlockCase from './case/single-text-block.case.js';
import { tokenize } from '../../../lib/tokenize.js';

test.describe('tokenize() - content blocks', () => {

  [
    textBlockCase,
    codeBlockCase,
    forMacroBlockCase,
    columnLayoutBlockCase,
    columnLayoutImplicitColumnsCase
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
