// @ts-check
import { test, expect } from '@playwright/test';
import { parseBlocks } from '../../../lib/blocks.js';
import { emitSlide } from '../../../lib/emitter.js';
import { createJSONTarget } from '../../../lib/json-target.js';

import { readAsset } from '../../fixture.js';

test('parse simple intermediary representation into json presentation', () => {
  // Given
  const ir = {
    frontmatter: {},
    contents: [{
      type: 'text',
      attributes: {
        id: 'main-text',
        style: 'color: red;'
      },
      children: [],
      content:
        'I have a song.\n' +
        "It's really, really good.\n" +
        "I have to sing it twice.\n" +
        "It's understood."
    }]
  }

  // When
  const target = createJSONTarget();
  emitSlide(ir, target);

  // Then
  expect(target.getJSON()).toEqual({
    id: '',
    name: '',
    notes: '',
    type: 'default',
    contents: [{
      contents: [],
      id: 'main-text',
      type: 'text',
      text: 'I have a song.\n' +
        "It's really, really good.\n" +
        "I have to sing it twice.\n" +
        "It's understood.",
      styles: {
        color: 'red'
      }
    }]
  })
})

test('parse intermediary representation with phases into json presentation', () => {
  // Given
  const ir = {
    frontmatter: {
      title: 'How to fail - main steps'
    },
    contents: [{
      type: 'text',
      depth: 0,
      attributes: {
        id: 'step1'
      },
      children: [],
      content: '1. Trying'
    }, {
      type: 'text',
      depth: 0,
      attributes: {
        id: 'finish',
        style: 'color: red;'
      },
      children: [],
      content: '2. FAILURE achieved!!'
    }],
    phases: [{
      type: 'phase',
      id: 'initial',
      transitions: {}
    }, {
      type: 'phase',
      id: 'trying',
      transitions: {
        step1: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' }
        }
      }
    }, {
      type: 'phase',
      id: 'failure',
      transitions: {
        finish: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' }
        }
      }
    }]
  }

  // When
  const target = createJSONTarget();
  emitSlide(ir, target);

  // Then
  expect(target.getJSON()).toEqual({
    id: '',
    name: '',
    title: 'How to fail - main steps',
    notes: '',
    type: 'default',
    contents: [{
      contents: [],
      id: 'step1',
      type: 'text',
      text: '1. Trying'
    }, {
      contents: [],
      id: 'finish',
      type: 'text',
      styles: {
        color: 'red'
      },
      text: '2. FAILURE achieved!!'
    }],
    steps: [
      { id: 'initial' },
      { id: 'trying', transitions: { step1: [{ opacity: "1" }, { opacity: "0" }]} },
      { id: 'failure', transitions: { finish: [{ opacity: "1" }, { opacity: "0" }]} },
    ]
  })
})

