import { readAsset } from '../../../fixture.js';

const description = 'block with content containing empty lines';

const heedFile = await readAsset(import.meta.url, './code-block.heed');

const tokenized = [
  {
    line: 0,
    depth: 1,
    type: 'blockStart',
    blockType: 'prism:code-block',
    attrText: '{ lang=clojure }',
  },
  { line: 1, depth: 1, type: 'attr', key: 'style', value: 'font-size: 40px' },
  {
    line: 2,
    depth: 1,
    type: 'content',
    value: '(defn evens [xs] (filter even? xs))',
  },
  { line: 3, depth: 1, type: 'blank' },
  {
    line: 4,
    depth: 1,
    type: 'content',
    value: '(->> (range) evens (take 10)) ;=> (0 2 4 6 8 10 12 14 16 18)',
  },
  { line: 5, depth: 1, type: 'blockEnd', data: '--' },
];

const intermediate = {
  frontmatter: {},
  custom: {},
  contents: [
    {
      type: 'prism:code-block',
      depth: 1,
      attributes: {
        lang: 'clojure',
        style: 'font-size: 40px',
      },
      children: [],
      content:
        '(defn evens [xs] (filter even? xs))\n' +
        '\n' +
        '(->> (range) evens (take 10)) ;=> (0 2 4 6 8 10 12 14 16 18)',
    },
  ],
};

export default {
  description,
  heedFile,
  tokenized,
  intermediate,
};
