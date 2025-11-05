import { expect } from '@playwright/test';

import { heedBin } from './heed-runner';
import { test } from '../../fixture.js';

test.describe('heed', () => {
  test('Running `heed` with no arguments in non-presentation folder fails gracefully', async ({
    tmpDir,
  }) => {
    // When
    const result = await heedBin([], { cwd: tmpDir });

    // Then
    const { code, stderr } = result;
    expect(code).toBe(1);
    expect(stderr).toContain(
      "Failed to start Heed: presentation.json not found in '/tmp/",
    );
  });
});
