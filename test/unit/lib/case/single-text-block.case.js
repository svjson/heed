import { readAsset } from '../../../fixture.js';

const description = 'single text block';

const heedFile = await readAsset(import.meta.url, './single-text-block.heed');

const tokenized = [
  {
    line: 0,
    depth: 1,
    type: 'blockStart',
    blockType: 'text',
    attrText: '{ id=main-text }',
  },
  { line: 1, depth: 1, type: 'attr', key: 'style', value: 'color: red;' },
  { line: 2, depth: 1, type: 'content', value: 'I have a song.' },
  { line: 3, depth: 1, type: 'content', value: "It's really, really good." },
  { line: 4, depth: 1, type: 'content', value: 'I have to sing it twice.' },
  { line: 5, depth: 1, type: 'content', value: "It's understood." },
  { line: 6, depth: 1, type: 'blockEnd', data: '--' },
];

const intermediate = {
  frontmatter: {},
  custom: {},
  contents: [
    {
      type: 'text',
      depth: 1,
      attributes: {
        id: 'main-text',
        style: 'color: red;',
      },
      children: [],
      content:
        'I have a song.\n' +
        "It's really, really good.\n" +
        'I have to sing it twice.\n' +
        "It's understood.",
    },
  ],
};

const jsonSlide = {
  id: '',
  name: '',
  notes: '',
  type: 'default',
  custom: {},
  contents: [
    {
      id: 'main-text',
      type: 'text',
      text:
        'I have a song.\n' +
        "It's really, really good.\n" +
        'I have to sing it twice.\n' +
        "It's understood.",
      styles: {
        color: 'red',
      },
    },
  ],
};

export default {
  description,
  heedFile: heedFile,
  tokenized,
  intermediate,
  jsonSlide,
};
