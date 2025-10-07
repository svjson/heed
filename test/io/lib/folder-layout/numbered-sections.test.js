import { expect } from '@playwright/test';

import { resolveIndex } from '../../../../lib/folder-layout/numbered-sections.js';
import { presentationTree_infiniteInsights } from '../../../data.js';
import { makeTmpDirTree, test } from '../../../fixture';

test.describe('folder-layout: numbered-sections', () => {
  let dir = null;
  let remove = null;

  const mkTree = async (tree) => {
    const res = await makeTmpDirTree(tree);
    dir = res.dir;
    remove = res.remove;
    return dir;
  };

  test.describe('resolveIndex', () => {
    test.afterEach(() => {
      if (typeof remove === 'function') {
        remove();
        dir = null;
        remove = null;
      }
    });

    test('it finds the default front-slide in slides/', async () => {
      // Given
      const tmpDir = await mkTree([
        { presentation: 'How To Be Awesome' },
        ['slides', [{ fileName: 'front.heed', slide: 'Hot To Be Awesome' }]],
      ]);

      // When
      const index = await resolveIndex(tmpDir);

      // Then
      expect(index).toEqual({ slides: [{ id: 'front' }] });
    });

    test('it finds a slide in numbered section folder', async () => {
      // Given
      const tmpDir = await mkTree([
        { presentation: 'How To Be Awesome' },
        ['slides', [{ fileName: 'front.heed', slide: 'How To Be Awesome' }]],
        [
          'sections',
          [
            [
              '01-intro',
              [
                [
                  'slides',
                  [
                    {
                      fileName: '01-towards-awesome.heed',
                      slide: 'First Steps Towards Awesome',
                    },
                  ],
                ],
              ],
            ],
          ],
        ],
      ]);

      // When
      const index = await resolveIndex(tmpDir);

      // Then
      expect(index).toEqual({
        slides: [{ id: 'front' }],
        sections: [
          {
            id: '01-intro',
            slides: [{ id: '01-towards-awesome' }],
          },
        ],
      });
    });

    test('it can resolve index with path and filenames attached', async () => {
      // Given
      const tmpDir = await mkTree([
        { presentation: 'How To Be Awesome' },
        ['slides', [{ fileName: 'front.heed', slide: 'How To Be Awesome' }]],
        [
          'sections',
          [
            [
              '01-intro',
              [
                [
                  'slides',
                  [
                    {
                      fileName: '01-towards-awesome.heed',
                      slide: 'First Steps Towards Awesome',
                    },
                  ],
                ],
              ],
            ],
          ],
        ],
      ]);

      // When
      const index = await resolveIndex(tmpDir, { includePath: true });

      // Then
      expect(index).toEqual({
        path: '',
        slides: [{ id: 'front', path: 'slides', fileName: 'front.heed' }],
        sections: [
          {
            path: 'sections/01-intro',
            id: '01-intro',
            slides: [
              {
                id: '01-towards-awesome',
                path: 'sections/01-intro/slides',
                fileName: '01-towards-awesome.heed',
              },
            ],
          },
        ],
      });
    });

    test('presentation of infinite insights', async () => {
      // Given
      const tmpDir = await mkTree(presentationTree_infiniteInsights);

      // When
      const index = await resolveIndex(tmpDir);

      // Then
      expect(index).toEqual({
        slides: [{ id: 'front' }],
        sections: [
          {
            id: '01-intro',
            slides: [
              { id: '01-nomenclature' },
              { id: '02-disclaimer' },
              { id: '03-you-are-wrong' },
            ],
          },
          {
            id: '02-part-one',
            slides: [
              { id: '01-all-that-rises-must-be-eaten' },
              { id: '02-i-ate-my-neighbour' },
              { id: '03-jail-is-overrated' },
            ],
            sections: [
              {
                id: '01-part-one-subsection-one',
                slides: [
                  { id: '01-geese-are-people-too' },
                  { id: '02-no-goose-ever-did-me-wrong' },
                  { id: '03-mongooses-are-not-the-same' },
                ],
              },
              {
                id: '02-part-one-subsection-two',
                slides: [
                  { id: '01-dont-let-ham-sandwiches-ruin-breakfast' },
                  { id: '02-dont-let-others-have-breakfast' },
                  { id: '03-breakfast-is-yours-and-only-yours' },
                ],
              },
            ],
          },
          {
            id: '03-part-two',
            slides: [
              { id: '01-when-i-was-a-child' },
              { id: '02-i-was-dropped-on-my-head' },
              { id: '03-and-that-has-shaped-my-life' },
              { id: '04-and-my-skull' },
            ],
          },
          {
            id: '04-part-three',
            slides: [
              { id: '01-i-filed-a-restraining-order' },
              { id: '02-against-my-cat' },
              { id: '03-it-was-rejected' },
              { id: '04-there-is-no-justice' },
            ],
          },
          {
            id: '05-final-thoughts',
            slides: [
              { id: '01-if-you-think-that-you-are-better-than-me' },
              { id: '02-you-are-probably-right' },
              { id: '03-but-probably-not-in-the-head' },
            ],
          },
        ],
      });
    });
  });
});
