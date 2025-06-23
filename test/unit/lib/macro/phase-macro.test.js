import { test, expect } from '@playwright/test';

import { extractPhaseDirectives } from '../../../../lib/macro/phase-macro.js';

test.describe('extractPhaseDirectives', () => {

  test('separate phase-attributes from standard attributes', () => {
    // Given
    const block = {
      attributes: {
        id: 'the-incredible-hulk',
        style: 'color: green;'
      },
      macroAttributes: {
        'phase{1}.style': 'opacity: 1 | 0',
        'phase[final].style': 'color: red | black'
      }
    };

    // When
    const phaseDirectives = extractPhaseDirectives(block);

    // Then
    expect(phaseDirectives).toEqual([
      {
        phase: '1',
        type: 'index-ref',
        target: 'the-incredible-hulk',
        property: 'style',
        enter: 'opacity: 1',
        rewind: 'opacity: 0'
      },
      {
        phase: 'final',
        type: 'id-ref',
        target: 'the-incredible-hulk',
        property: 'style',
        enter: 'color: red',
        rewind: 'color: black'
      }
    ]);

    expect(block.attributes).toEqual({
      id: 'the-incredible-hulk',
      style: 'color: green;'
    });
  });

  test('separate multi-property style phase-attributes from standard attributes', () => {
    // Given
    const block = {
      attributes: {
        id: 'the-incredible-hulk',
        style: 'color: green;',
      },
      macroAttributes: {
        'phase{1}.style': 'opacity: 1 | 0; color: black | purple',
        'phase[final].style': 'color: red | black'
      }
    };

    // When
    const phaseDirectives = extractPhaseDirectives(block);

    // Then
    expect(phaseDirectives).toEqual([
      {
        phase: '1',
        type: 'index-ref',
        target: 'the-incredible-hulk',
        property: 'style',
        enter: 'opacity: 1',
        rewind: 'opacity: 0'
      },
      {
        phase: '1',
        type: 'index-ref',
        target: 'the-incredible-hulk',
        property: 'style',
        enter: 'color: black',
        rewind: 'color: purple'
      },
      {
        phase: 'final',
        type: 'id-ref',
        target: 'the-incredible-hulk',
        property: 'style',
        enter: 'color: red',
        rewind: 'color: black'
      }
    ]);

    expect(block.attributes).toEqual({
      id: 'the-incredible-hulk',
      style: 'color: green;'
    });
  });

});
