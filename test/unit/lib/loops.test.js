// @ts-check
import { test, expect } from '@playwright/test';
import { expandLoops } from '../../../lib/loops.js';

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
    content:
      '<h1>Bullet {n}</h1>'
  }]

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
    content: '<h1>Bullet 1</h1>',
    children: []
  }, {
    type: 'html',
    attributes: {
      id: 'bull2',
      style: ['font-size: 20px', 'color:lightgray']
    },
    content: '<h1>Bullet 2</h1>',
    children: []
  }, {
    type: 'html',
    attributes: {
      id: 'bull3',
      style: ['font-size: 20px', 'color:darkgray']
    },
    content: '<h1>Bullet 3</h1>',
    children: []
  }])

})
