import path from 'path';

import { expect } from '@playwright/test';
import { test } from '../../fixture';
import { createPresentationDotJson } from '../../../lib/presentation';
import { createSlide } from '../../../lib/slide';
import { NumberedSections } from '../../../lib/folder-layout';

test.describe('NumberedSections', () => {

  test.describe('resolveIndex', () => {

    test('it finds the default front-slide in slides/', async({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'How To Be Awesome');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'), { title: 'How To Be Awesome'});

      // When
      const index = await NumberedSections.resolveIndex(tmpDir);

      // Then
      expect(index).toEqual(
        { slides: [{ id: 'front' }] }
      )
    });

    test('it finds a slide in numbered section folder', async({ tmpDir }) => {
      // Given
      await createPresentationDotJson(tmpDir, 'How To Be Awesome');
      await createSlide(path.join(tmpDir, 'slides', 'front.heed'),
        { title: 'How To Be Awesome'});
      await createSlide(path.join(tmpDir, 'sections', '01-intro', 'slides', '01-towards-awesome.heed'),
        { title: 'First Steps Towards Awesome'});

      // When
      const index = await NumberedSections.resolveIndex(tmpDir);

      // Then
      expect(index).toEqual(
        { slides: [{ id: 'front' }],
          sections: [{
            id: '01-intro',
            slides: [{ id: '01-towards-awesome'}]
          }]
        }
      )
    });


  });

});
