import { test, expect } from '@playwright/test';

import { extractPhaseDirectives, applyPhaseAttributes } from '../../../lib/phases.js';

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


test.describe('applyPhaseAttributes', () => {

  test('phases are created from index references', () => {
    // Given
    const ir = {
      frontmatter: { title: 'Test Slide' },
      contents: [{
        type: 'text',
        attributes: {
          id: 'hello-dave',
          style: 'color: green;'
        },
        macroAttributes: {
          'phase{1}.style': 'opacity: 1 | 0',
        },
        content: 'Hello'
      }, {
        type: 'text',
        attributes: {
          id: 'world-text',
        },
        macroAttributes: {
          'phase{2}.style': 'color: red | black'
        },
        content: 'World'
      }]
    };

    // When
    const applied = applyPhaseAttributes(ir);

    // Then
    expect(applied).toEqual({
      frontmatter: { title: 'Test Slide' },
      contents: [{
        type: 'text',
        attributes: {
          id: 'hello-dave',
          style: 'color: green;'
        },
        macroAttributes: {
          'phase{1}.style': 'opacity: 1 | 0',
        },
        content: 'Hello'
      }, {
        type: 'text',
        attributes: {
          id: 'world-text'
        },
        macroAttributes: {
          'phase{2}.style': 'color: red | black'
        },
        content: 'World'
      }],
      phases: [{
        type: 'phase',
        id: 'initial',
        transitions: {}
      }, {
        type: 'phase',
        id: 'phase1',
        transitions: {
          'hello-dave': {
            enter: { opacity: '1' },
            rewind: { opacity: '0' }
          }
        }
      }, {
        type: 'phase',
        id: 'phase2',
        transitions: {
          'world-text': {
            enter: { color: 'red' },
            rewind: { color: 'black' }
          }
        }
      }]
    });
  });

  test('phases are created from id references', () => {
    // Given
    const ir = {
      frontmatter: { title: 'Test Slide' },
      contents: [{
        type: 'text',
        attributes: {
          id: 'hello-dave',
          style: 'color: green;'
        },
        macroAttributes: {
          'phase[first].style': 'opacity: 1 | 0',
        },
        content: 'Hello'
      }, {
        type: 'text',
        attributes: {
          id: 'world-text'
        },
        macroAttributes: {
          'phase[second].style': 'color: red | black'
        },
        content: 'World'
      }]
    };

    // When
    const applied = applyPhaseAttributes(ir);

    // Then
    expect(applied).toEqual({
      frontmatter: { title: 'Test Slide' },
      contents: [{
        type: 'text',
        attributes: {
          id: 'hello-dave',
          style: 'color: green;'
        },
        macroAttributes: {
          'phase[first].style': 'opacity: 1 | 0',
        },
        content: 'Hello'
      }, {
        type: 'text',
        attributes: {
          id: 'world-text'
        },
        macroAttributes: {
          'phase[second].style': 'color: red | black'
        },
        content: 'World'
      }],
      phases: [{
        type: 'phase',
        id: 'initial',
        transitions: {}
      }, {
        type: 'phase',
        id: 'first',
        transitions: {
          'hello-dave': {
            enter: { opacity: '1' },
            rewind: { opacity: '0' }
          }
        }
      }, {
        type: 'phase',
        id: 'second',
        transitions: {
          'world-text': {
            enter: { color: 'red' },
            rewind: { color: 'black' }
          }
        }
      }]
    });
  });

});
