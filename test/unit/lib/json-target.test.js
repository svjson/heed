// @ts-check
import { test, expect } from '@playwright/test';

import columnLayoutBlockCase from './case/column-layout-block.case.js';
import simpleWithPhasesCase from './case/simple-with-phases.case.js';
import singleTextBlockCase from './case/single-text-block.case.js';
import { emitSlide } from '../../../lib/emitter.js';
import { createJSONTarget } from '../../../lib/json-target.js';

test.describe('createJSONTarget() - emitting JSON', () => {

  test('parse simple intermediary representation into json presentation', async () => {
    // Given
    const ir = singleTextBlockCase.intermediate;

    // When
    const target = createJSONTarget();
    emitSlide(ir, target);

    // Then
    expect(target.getJSON()).toEqual(singleTextBlockCase.jsonSlide);
  });

  test('parse intermediary representation with phases into json presentation', () => {
    // Given
    const ir = simpleWithPhasesCase.intermediateExpanded;

    // When
    const target = createJSONTarget();
    emitSlide(ir, target);

    // Then
    expect(target.getJSON()).toEqual(simpleWithPhasesCase.jsonSlide);
  });

  test('parse intermediary representation with column layout into json presentation', () => {
    const ir = columnLayoutBlockCase.intermediate;

    // When
    const target = createJSONTarget();
    emitSlide(ir, target);

    // Then
    expect(target.getJSON()).toEqual(columnLayoutBlockCase.jsonSlide);
  });

});
