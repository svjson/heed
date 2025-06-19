// @ts-check
import { test, expect } from '@playwright/test';

import codeBlockCase from './case/code-block.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import frontmatterOnlyCase from './case/frontmatter-only.case.js';
import simpleWithPhasesCase from './case/simple-with-phases.case.js';
import textBlockCase from './case/single-text-block.case.js';
import { parseHeedFile } from '../../../lib/heed-file.js';

test.describe('parseHeedFile()', () => {

  [
    codeBlockCase,
    forMacroBlockCase,
    frontmatterOnlyCase,
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
