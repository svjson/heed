import { expect } from '@playwright/test';

import { resolveDirContext } from '../../../../lib/folder-layout/index.js';
import { resolveIndex } from '../../../../lib/folder-layout/numbered-sections.js';
import { presentationTree_infiniteInsights } from '../../../data.js';
import { makeTmpDirTree, test } from '../../../fixture.js';

let dir = null;
let remove = null;

test.describe('folder-layout', () => {
  test.describe('resolveDirContext()', () => {
    test.describe('in multi-section presentation', () => {
      test.beforeAll(async () => {
        const tmpTree = await makeTmpDirTree(presentationTree_infiniteInsights);

        dir = tmpTree.dir;
        remove = tmpTree.remove;
      });

      test.afterAll(() => {
        remove();
      });

      [
        { path: '.', expected: { type: 'root', path: '', thread: [] } },
        { path: './assets', expected: { type: 'root', path: '', thread: [] } },
        {
          path: './sections',
          expected: { type: 'root', path: '', thread: [] },
        },
        { path: '', expected: { type: 'root', path: '', thread: [] } },
        { path: 'assets', expected: { type: 'root', path: '', thread: [] } },
        { path: 'sections', expected: { type: 'root', path: '', thread: [] } },
        { path: `${dir}`, expected: { type: 'root', path: '', thread: [] } },
        {
          path: `${dir}/assets`,
          expected: { type: 'root', path: '', thread: [] },
        },
        {
          path: `${dir}/sections`,
          expected: { type: 'root', path: '', thread: [] },
        },
        {
          path: './sections/01-intro',
          expected: {
            type: 'section',
            path: 'sections/01-intro',
            thread: ['sections', '01-intro'],
          },
        },
        {
          path: 'sections/01-intro',
          expected: {
            type: 'section',
            path: 'sections/01-intro',
            thread: ['sections', '01-intro'],
          },
        },
      ].forEach(({ path: queryPath, expected }) => {
        test(`${queryPath}`, async () => {
          const index = await resolveIndex(dir, { includePath: true });
          expect(await resolveDirContext(dir, index, queryPath)).toEqual(
            expected,
          );
        });
      });
    });
  });
});
