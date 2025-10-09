import { test, expect } from '@playwright/test';

import { resolveDirContext } from '../../../../lib/folder-layout';

test.describe('folder-layout', () => {
  test.describe('resolveDirContext', () => {
    const index = {
      slides: [{ id: 'front' }, { id: 'front_01-toolbox' }],
      sections: [
        { id: '01-beep', path: 'sections/01-beep' },
        { id: '02-bloop', path: 'sections/02-bloop' },
        { id: '03-babaloop', path: 'sections/03-babaloop' },
      ],
    };

    [
      {
        path: '',
        expected: {
          type: 'root',
          path: '',
          thread: [],
        },
      },
      {
        path: 'sections/02-bloop',
        expected: {
          type: 'section',
          path: 'sections/02-bloop',
          thread: ['sections', '02-bloop'],
        },
      },
    ].forEach(({ path: queryPath, expected }) => {
      test(`${queryPath}`, async () => {
        expect(await resolveDirContext('', index, queryPath)).toEqual(expected);
      });
    });
  });
});
