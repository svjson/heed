// @ts-check
import { test, expect } from '@playwright/test';

import accumulateFromAsideContentCase from './case/accumulate-from-aside-content.case.js';
import codeBlockCase from './case/code-block.case.js';
import forMacroBlockWithRangeCase from './case/for-macro-block-with-range.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import frontmatterOnlyCase from './case/frontmatter-only.case.js';
import linearTextAccumulationCase from './case/linear-text-accumulation.case.js';
import revealFrontmatterMacroCase from './case/reveal-frontmatter-macro.case.js';
import simpleWithPhasesCase from './case/simple-with-phases.case.js';
import textBlockCase from './case/single-text-block.case.js';
import { parseHeedFile } from '../../../lib/heed-file.js';

test.describe('parseHeedFile()', () => {

  [
    accumulateFromAsideContentCase,
    codeBlockCase,
    forMacroBlockCase,
    forMacroBlockWithRangeCase,
    frontmatterOnlyCase,
    linearTextAccumulationCase,
    revealFrontmatterMacroCase,
    simpleWithPhasesCase,
    textBlockCase,
  ].forEach(testCase => {
    test(`parse .heed-file with ${testCase.parseHeedFileDescription ?? testCase.description}`, async () => {
      // Given
      const fileData = testCase.heedFile;

      // When
      const ir = parseHeedFile(fileData);

      // Then
      expect(ir).toEqual(testCase.intermediateExpanded ?? testCase.intermediate);
    });

  });

});
