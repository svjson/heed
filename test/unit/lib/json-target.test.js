// @ts-check
import { test, expect } from '@playwright/test';

import columnLayoutBlockCase from './case/column-layout-block.case.js';
import forMacroBlockCase from './case/for-macro-block.case.js';
import simpleWithPhasesCase from './case/simple-with-phases.case.js';
import singleTextBlockCase from './case/single-text-block.case.js';
import { emitSlide } from '../../../lib/emitter.js';
import { createJSONTarget } from '../../../lib/json-target.js';

test.describe('createJSONTarget() - emitting JSON', () => {

  [
    forMacroBlockCase,
    singleTextBlockCase,
    simpleWithPhasesCase,
    columnLayoutBlockCase
  ].forEach(testCase => {
    test(`parse intermediary representation of ${testCase.description} into json slide format`,
      () => {
        // Given
        const ir = testCase.intermediateExpanded ?? testCase.intermediate;

        // When
        const target = createJSONTarget();
        emitSlide(ir, target);

        // Then
        expect(target.getJSON()).toEqual(testCase.jsonSlide);
      });
  });

});
