// @ts-check
import { test, expect } from '@playwright/test';
import { expandLoops } from '../../../lib/loops.js';

test.describe('expandLoops()', () => {

test('simple repeating loop is unrolled', () => {
  // Given
  const blocks = [{
    type: 'for',
    attributes: {
      id: 'bull{n}',
      style: 'font-size: 20px',
      'style[n=1]': 'color:white',
      'style[n=2]': 'color:lightgray',
      'style[n=3]': 'color:darkgray',
    },
    macroAttributes: {
      type: 'html',
      each: 'n',
      values: '1,2,3',
    },
    children: [],
    depth: 0,
    content:
      '<h1>Bullet {n}</h1>'
  }];

  // When
  const result = expandLoops(blocks);

  // Then
  expect(result.length).toBe(3);
  expect(result).toEqual([{
    type: 'html',
    attributes: {
      id: 'bull1',
      style: ['font-size: 20px', 'color:white'],
    },
    macroAttributes: {},
    content: '<h1>Bullet 1</h1>',
    depth: 0,
    children: []
  }, {
    type: 'html',
    attributes: {
      id: 'bull2',
      style: ['font-size: 20px', 'color:lightgray']
    },
    macroAttributes: {},
    content: '<h1>Bullet 2</h1>',
    depth: 0,
    children: []
  }, {
    type: 'html',
    attributes: {
      id: 'bull3',
      style: ['font-size: 20px', 'color:darkgray']
    },
    macroAttributes: {},
    content: '<h1>Bullet 3</h1>',
    depth: 0,
    children: []
  }]);

});

  test('Non-loop macro-attribute %phase{2} is preserved in output', () => {
    // Given
    const blocks = [{
      type: 'for',
      attributes: {
        id: 'img{n}',
        style: 'opacity: 0; position: absolute',
        src: 'image{n}.png',
        'style[n=1]': 'top:20%; left:15%',
        'style[n=2]': 'top:65%; left:80%',
        'style[n=3]': 'top:45%; left:4%'
      },
      macroAttributes: {
        type: 'image',
        each: 'n',
        values: '1,2,3',
        'phase{2}.style': 'opacity: 1 | 0'
      },
      depth: 0,
      children: []
    }];

    // When
    const result = expandLoops(blocks);

    // Then
    expect(result.length).toBe(3);
    expect(result).toEqual([{
      type: 'image',
      attributes: {
        id: 'img1',
        style: [
          'opacity: 0; position: absolute',
          'top:20%; left:15%'
        ],
        src: 'image1.png'
      },
      macroAttributes: {
        'phase{2}.style': 'opacity: 1 | 0'
      },
      depth: 0,
      children: []
    }, {
      type: 'image',
      attributes: {
        id: 'img2',
        style: [
          'opacity: 0; position: absolute',
          'top:65%; left:80%'
        ],
        src: 'image2.png'
      },
      macroAttributes: {
        'phase{2}.style': 'opacity: 1 | 0'
      },
      depth: 0,
      children: []
    }, {
      type: 'image',
      attributes: {
        id: 'img3',
        style: [
          'opacity: 0; position: absolute',
          'top:45%; left:4%'
        ],
        src: 'image3.png'
      },
      macroAttributes: {
        'phase{2}.style': 'opacity: 1 | 0'
      },
      depth: 0,
      children: []
    }]);
  });

})
