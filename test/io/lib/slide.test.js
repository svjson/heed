import path from 'path';

import { test, expect } from '@playwright/test';

import { loadSlide } from '../../../lib/slide';
import forMacroBlockCase from '../../unit/lib/case/for-macro-block.case';
import slideWithBrokenNotesRefCase from '../../unit/lib/case/slide-with-broken-notes-ref.case.js';
import slideWithNotesAsideBlockCase from '../../unit/lib/case/slide-with-notes-aside-block.case.js';
import slideWithNotesRefCase from '../../unit/lib/case/slide-with-notes-ref.case.js';

test.describe('loadSlide()', () => {

  test('load .heed-slide', async () => {
    // Given
    const presentationRoot = path.resolve('test');
    const slidePath = path.join(...'unit/lib/case/for-macro-block'.split('/'));

    // When
    const slide = await loadSlide(presentationRoot, slidePath);

    // Then
    expect(slide).toEqual(forMacroBlockCase.jsonSlide);
  });

  test(
    'load .heed-slide with notes-reference and { includeNotes: true }',
    async () => {
      // Given
      const presentationRoot = path.resolve('test');
      const slidePath = path.join(...'unit/lib/case/slide-with-notes-ref'.split('/'));

      // When
      const slide = await loadSlide(presentationRoot, slidePath, { includeNotes: true });

      // Then
      expect(slide).toEqual({
        ...slideWithNotesRefCase.jsonSlide,
        notes: [{
          type: 'text',
          source: 'boppe.txt',
          content: [
            'En boppe där',
            'titta, boppe där',
            'En boppe där...',
            'En bomerang...',
            'Malax-Petalax damkör var det!',
            ''
          ].join('\n')
        }]
      });
    });

  test(
    'load .heed-slide with broken notes-reference and { includeNotes: true }',
    async () => {
      // Given
      const presentationRoot = path.resolve('test');
      const slidePath = path.join(...'unit/lib/case/slide-with-broken-notes-ref'.split('/'));

      // When
      const slide = await loadSlide(presentationRoot, slidePath, { includeNotes: true });

      // Then
      expect(slide).toEqual({
        ...slideWithBrokenNotesRefCase.jsonSlide,
        notes: [{
          type: 'error',
          source: 'flaming-mungo.txt',
          content: "Referenced notes file 'flaming-mungo.txt' does not exist."
        }]
      });
    });

  test(
    'load .heed-slide with notes aside-block and { includeNotes: true }',
    async () => {
      // Given
      const presentationRoot = path.resolve('test');
      const slidePath = path.join(...'unit/lib/case/slide-with-notes-aside-block'.split('/'));

      // When
      const slide = await loadSlide(presentationRoot, slidePath, { includeNotes: true });

      // Then
      expect(slide).toEqual({
        ...slideWithNotesAsideBlockCase.jsonSlide,
        notes: [{
          type: 'text',
          source: 'Slide',
          content: [
            'Points to drive home:',
            '- Regular crypto scams are becoming less and less lucrative.',
            '- Most people stop listening immediately when they hear "block chain".',
            '- Everybody likes toast',
            '- Toast is the new crypto scam.'
          ].join('\n')
        }]
      });

    }
  );
});
