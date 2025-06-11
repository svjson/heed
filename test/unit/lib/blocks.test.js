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
