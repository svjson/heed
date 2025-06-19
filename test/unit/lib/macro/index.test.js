import { test, expect } from '@playwright/test';

import { expandMacroAttributes } from '../../../../lib/macro';

test.describe('phaseMacroAttributes', () => {

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
    const applied = expandMacroAttributes(ir);

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
    const applied = expandMacroAttributes(ir);

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
