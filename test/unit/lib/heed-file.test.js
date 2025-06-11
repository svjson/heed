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
