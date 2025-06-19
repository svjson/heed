// @ts-check
import { test, expect } from '@playwright/test';

import { tokenize } from '../../../lib/tokenize.js';
import { readAsset } from '../../fixture.js';

test.describe('tokenize() - content blocks', () => {

  test('tokenize a single text block', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/single-text-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 0, depth: 1, type: 'blockStart', blockType: 'text', attrText: '{ id=main-text }' },
      { line: 1, depth: 1, type: 'attr', key: 'style', value: 'color: red;' },
      { line: 2, depth: 1, type: 'content', value: 'I have a song.', },
      { line: 3, depth: 1, type: 'content', value: "It's really, really good." },
      { line: 4, depth: 1, type: 'content', value: 'I have to sing it twice.' },
      { line: 5, depth: 1, type: 'content', value: "It's understood." },
      { line: 6, depth: 1, type: 'blockEnd', data: '--'}
    ]);
  });

  test('tokenize a block with content containing empty lines', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/code-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 0, depth: 1, type: 'blockStart', blockType: 'prism:code-block', attrText: '{ lang=clojure }' },
      { line: 1, depth: 1, type: 'attr', key: 'style', value: 'font-size: 40px' },
      { line: 2, depth: 1, type: 'content', value: '(defn evens [xs] (filter even? xs))' },
      { line: 3, depth: 1, type: 'blank' },
      { line: 4, depth: 1, type: 'content', value: '(->> (range) evens (take 10)) ;=> (0 2 4 6 8 10 12 14 16 18)' },
      { line: 5, depth: 1, type: 'blockEnd', data: '--'}
    ]);
  });

  test('tokenize a %for-macro block', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/for-macro-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 1, depth: 1, type: 'macroBlockStart', blockType: 'for', attrText: '{ %type=image id=block{n} }' },
      { line: 2, depth: 1, type: 'macroAttr', key: 'each', value: 'n' },
      { line: 3, depth: 1, type: 'macroAttr', key: 'values', value: '1,2,3' },
      { line: 4, depth: 1, type: 'attr', key: 'source', value: 'image{n}.png' },
      { line: 5, depth: 1, type: 'attr', key: 'style', value: 'opacity: 1;' },
      { line: 6, depth: 1, type: 'blockEnd', data: '--' }
    ]);

  });

  test('tokenize a column-layout block with children', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/column-layout-block.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 1, depth: 1, type: 'blockStart', blockType: 'column-layout', attrText: '' },

      { line: 2, depth: 2, type: 'blockStart', blockType: 'column', attrText: '' },

      { line: 3, depth: 3, type: 'blockStart', blockType: 'html', attrText: '' },
      { line: 4, depth: 3, type: 'attr', key: 'style', value: 'font-size: 40px' },
      { line: 5, depth: 3, type: 'content', value: '<h1>This is column 1</h1>' },
      { line: 6, depth: 3, type: 'blockEnd', data: '--' },

      { line: 7, depth: 3, type: 'blockStart', blockType: 'image', attrText: '' },
      { line: 8, depth: 3, type: 'attr', key: 'src', value: 'column-one-image.jpg' },
      { line: 9, depth: 3, type: 'blockEnd', data: '--'},

      { line: 10, depth: 2, type: 'blockEnd', data: '--'},

      { line: 11, depth: 2, type: 'blockStart', blockType: 'column', attrText: '' },
      { line: 12, depth: 3, type: 'blockStart', blockType: 'html' , attrText: '' },
      { line: 13, depth: 3, type: 'attr', key: 'style', value: 'font-size: 20px' },
      { line: 14, depth: 3, type: 'content', value: '<h2>This is column 2</h2>' },
      { line: 15, depth: 3, type: 'blockEnd', data: '--'},

      { line: 16, depth: 3, type: 'blockStart', blockType: 'text', attrText: '' },
      { line: 17, depth: 3, type: 'content', value: 'This could be a long-winded tale about column 2,' },
      { line: 18, depth: 3, type: 'content', value: "but isn't." },
      { line: 19, depth: 3, type: 'blockEnd', data: '--'},

      { line: 20, depth: 2, type: 'blockEnd', data: '--'},
      { line: 21, depth: 1, type: 'blockEnd', data: '--'},
    ]);

  });

  test('tokenize a column-layout block with implicit "column" blocks and children', async () => {
    // Given
    const fileData = await readAsset(import.meta.url, './assets/column-layout-implicit-columns.heed');

    // When
    const tokens = tokenize(fileData, 0);

    // Then
    expect(tokens).toEqual([
      { line: 1, depth: 1, type: 'blockStart', blockType: 'column-layout', attrText: '' },

      { line: 2, depth: 2, type: 'blockStart', blockType: '', attrText: '' },

      { line: 3, depth: 3, type: 'blockStart', blockType: 'html', attrText: '' },
      { line: 4, depth: 3, type: 'attr', key: 'style', value: 'font-size: 40px' },
      { line: 5, depth: 3, type: 'content', value: '<h1>This is column 1</h1>' },
      { line: 6, depth: 3, type: 'blockEnd', data: '--' },

      { line: 7, depth: 3, type: 'blockStart', blockType: 'image', attrText: '' },
      { line: 8, depth: 3, type: 'attr', key: 'src', value: 'column-one-image.jpg' },
      { line: 9, depth: 3, type: 'blockEnd', data: '--'},

      { line: 10, depth: 2, type: 'blockEnd', data: '--'},

      { line: 11, depth: 2, type: 'blockStart', blockType: '', attrText: '' },
      { line: 12, depth: 3, type: 'blockStart', blockType: 'html' , attrText: '' },
      { line: 13, depth: 3, type: 'attr', key: 'style', value: 'font-size: 20px' },
      { line: 14, depth: 3, type: 'content', value: '<h2>This is column 2</h2>' },
      { line: 15, depth: 3, type: 'blockEnd', data: '--'},

      { line: 16, depth: 3, type: 'blockStart', blockType: 'text', attrText: '' },
      { line: 17, depth: 3, type: 'content', value: 'This could be a long-winded tale about column 2,' },
      { line: 18, depth: 3, type: 'content', value: "but isn't." },
      { line: 19, depth: 3, type: 'blockEnd', data: '--'},

      { line: 20, depth: 2, type: 'blockEnd', data: '--'},
      { line: 21, depth: 1, type: 'blockEnd', data: '--'},
    ]);

  });


});
