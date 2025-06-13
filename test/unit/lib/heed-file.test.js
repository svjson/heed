// @ts-check
import { test, expect } from '@playwright/test';
import { parseHeedFile } from '../../../lib/heed-file.js';

import { readAsset } from '../../fixture.js';

test('parse .heed-file with only a frontmatter header', async () => {
  // Given
  const fileData = await readAsset(import.meta.url, './assets/frontmatter-only.heed');

  // When
  const ir = parseHeedFile(fileData);

  // Then
  expect(ir).toEqual({
    frontmatter: {
      id: 'header-only',
      title: 'There is a title, though!',
      type: 'default'
    },
    contents: []
  });
});

test('parse .heed-file with a simple text-block', async () => {
  // Given
  const fileData = await readAsset(import.meta.url, './assets/single-text-block.heed');

  // When
  const ir = parseHeedFile(fileData);

  // Then
  expect(ir).toEqual({
    frontmatter: {},
    contents: [{
      type: 'text',
      depth: 0,
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
  })

});


test('parse .heed-file with a phases aside-block', async () => {
  // Given
  const fileData = await readAsset(import.meta.url, './assets/simple-with-phases.heed');

  // When
  const ir = parseHeedFile(fileData);

  // Then
  expect(ir).toEqual({
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
  });
});
