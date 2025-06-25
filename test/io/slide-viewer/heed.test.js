import { expect } from '@playwright/test';

import { test } from '../../fixture.js';

let context;
let page;

test.describe('Heed module functions', () => {

  test.beforeAll(async ({ browser, slideViewerStatic }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(`${slideViewerStatic}/index.html`);

    await page.waitForFunction(() => typeof window.makeUri === 'function');
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test.describe('hashIndex', async () => {

    const hashIndex = async () => await page.evaluate((_) => window.hashIndex());

    [
      ['', 0],
      ['#8', 8],
      ['#10', 10],
      ['#blubb', 0]
    ].forEach(([hash, index]) => {
      test(`parse index from '${hash}'`, async () => {
        await page.evaluate(
          (hash) => window.location.hash = hash,
          hash);
        expect(await hashIndex()).toEqual(index);
      });
    });

  });

  test.describe('makeUri', () => {

    const makeUri = (...args) => {
      const arrp = (args.length === 1 && Array.isArray(args[0]));
      const argsArray = arrp ? args[0] : args;

      return page.evaluate((opts) => {
        const [args, varargs] = opts;
        if (varargs) {
          return window.makeUri(...args);
        }
        return window.makeUri(args);
      }, [argsArray, !arrp]);
    };

    [
      [['/somewhere', 'in', 'space'], '/somewhere/in/space'],
      [['/somewhere/', 'in', 'space'], '/somewhere/in/space'],
      [['/somewhere', '//in', '/space'], '/somewhere/in/space'],
      [['/somewhere/', '/in/', '/space'], '/somewhere/in/space'],
      [['/somewhere'], '/somewhere']
    ].forEach(([args, expected]) => {
      test(`${JSON.stringify(args)}`, async () => {
        expect(await makeUri(args)).toEqual(expected);
        expect(await makeUri.apply(null, args)).toEqual(expected);
      });
    });
  });
});

