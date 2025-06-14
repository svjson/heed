// @ts-check
import { test, expect } from '@playwright/test';

import { parseStyle } from '../../../lib/common.js'

test.describe('parseStyle', () => {

  test('parse a single style property', () => {
    expect(parseStyle('opacity: 1;')).toEqual({ opacity: '1'});
    expect(parseStyle('text-align: right')).toEqual({ 'text-align': 'right'});
  });

  test('parse multiple style properties', () => {
    expect(parseStyle('text-decoration: line-through; color: #888888')).toEqual({
      'text-decoration': 'line-through',
      color: '#888888'
    });
  });

  test('parse array of style properties', () => {
    expect(parseStyle(['text-decoration: line-through', 'color: #888888'])).toEqual({
      'text-decoration': 'line-through',
      color: '#888888'
    });
  });

})
