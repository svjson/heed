// @ts-check
import { test, expect } from '@playwright/test';

import { parseBlocks } from '../../../lib/blocks.js';
import { readAsset } from '../../fixture.js';

test.describe('parseBlocks()', () => {

  test('Parse %for-macro block', async () => {
    // Given
    const source = await readAsset(import.meta.url, './assets/for-macro-block.heed');
    const tokens = [
      { line: 1, type: 'macroBlockStart', blockType: 'for', depth: 1, attrText: '{ %type=image id=block{n} }' },
      { line: 2, type: 'macroAttr', key: 'each', depth: 1, value: 'n' },
      { line: 3, type: 'macroAttr', key: 'values', depth: 1, value: '1,2,3' },
      { line: 4, type: 'attr', key: 'source', depth: 1, value: 'image{n}.png' },
      { line: 5, type: 'attr', key: 'style', depth: 1, value: 'opacity: 1;' },
      { line: 6, type: 'blockEnd', depth: 1, data: '--' }
    ];

    // When
    const blocks = parseBlocks(tokens, source);

    // Then
    expect(blocks).toEqual([
      {
        blockType: 'macro',
        type: 'for',
        macroAttributes: {
          type: 'image',
          each: 'n',
          values: '1,2,3'
        },
        attributes: {
          id: 'block{n}',
          source: 'image{n}.png',
          style: 'opacity: 1;'
        },
        content: '',
        children: [],
        depth: 1
      }
    ]);
  });

  test('Parse column-layout block with content', async () => {
    const source = await readAsset(import.meta.url, './assets/column-layout-block.heed');
    const tokens = [
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
    ];

    // When
    const blocks = parseBlocks(tokens, source);

    // Then
    expect(blocks).toEqual([
      {
        type: 'column-layout',
        attributes: {},
        content: '',
        children: [
          {
            type: 'column',
            attributes: {},
            content: '',
            depth: 2,
            children: [
              {
                type: 'html',
                attributes: {
                  style: 'font-size: 40px'
                },
                content: '<h1>This is column 1</h1>',
                depth: 3,
                children: []
              },
              {
                type: 'image',
                attributes: {
                  src: 'column-one-image.jpg'
                },
                content: '',
                depth: 3,
                children: []
              }
            ]
          },
          {
            type: 'column',
            attributes: {},
            content: '',
            depth: 2,
            children: [
              {
                type: 'html',
                attributes: {
                  style: 'font-size: 20px'
                },
                content: '<h2>This is column 2</h2>',
                depth: 3,
                children: []
              },
              {
                type: 'text',
                attributes: {
                },
                content: "This could be a long-winded tale about column 2,\nbut isn't.",
                depth: 3,
                children: [],
              }
            ]
          }
        ],
        depth: 1
      }
    ]);
  });

  test('Parse column-layout block with implicit column blocks', async () => {
    const source = await readAsset(import.meta.url, './assets/column-layout-block.heed');
    const tokens = [
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
    ];

    // When
    const blocks = parseBlocks(tokens, source);

    // Then
    expect(blocks).toEqual([
      {
        type: 'column-layout',
        attributes: {},
        content: '',
        children: [
          {
            type: 'column',
            attributes: {},
            content: '',
            depth: 2,
            children: [
              {
                type: 'html',
                attributes: {
                  style: 'font-size: 40px'
                },
                content: '<h1>This is column 1</h1>',
                depth: 3,
                children: []
              },
              {
                type: 'image',
                attributes: {
                  src: 'column-one-image.jpg'
                },
                content: '',
                depth: 3,
                children: []
              }
            ]
          },
          {
            type: 'column',
            attributes: {},
            content: '',
            depth: 2,
            children: [
              {
                type: 'html',
                attributes: {
                  style: 'font-size: 20px'
                },
                content: '<h2>This is column 2</h2>',
                depth: 3,
                children: []
              },
              {
                type: 'text',
                attributes: {
                },
                content: "This could be a long-winded tale about column 2,\nbut isn't.",
                depth: 3,
                children: [],
              }
            ]
          }
        ],
        depth: 1
      }
    ]);
  });
});
