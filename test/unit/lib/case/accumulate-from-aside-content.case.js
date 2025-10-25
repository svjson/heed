import { readAsset } from '../../../fixture.js';

const description = 'accumulating %for-block macro';

const heedFile = await readAsset(
  import.meta.url,
  './accumulate-from-aside-content.heed',
);

const tokenized = [
  {
    line: 4,
    depth: 1,
    type: 'macroBlockStart',
    blockType: 'for',
    attrText: '{ %type=html id=html-block{n} }',
  },
  { line: 5, depth: 1, type: 'macroAttr', key: 'each', value: 'n' },
  { line: 6, depth: 1, type: 'macroAttr', key: 'values', value: '1,2,3' },
  {
    line: 7,
    depth: 1,
    type: 'macroAttr',
    key: 'content',
    value: 'content:mycontent{n}',
  },
  { line: 8, depth: 1, type: 'blockEnd', data: '--' },
  {
    line: 10,
    depth: 1,
    type: 'asideBlockStart',
    blockType: 'content',
    attrText: '{ id=mycontent1 }',
  },
  {
    line: 11,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'cgroup',
  },
  {
    line: 12,
    depth: 1,
    type: 'content',
    value: '<h1>This is a giant header!</h1>',
  },
  { line: 13, depth: 1, type: 'asideEnd' },
  {
    line: 15,
    depth: 1,
    type: 'asideBlockStart',
    blockType: 'content',
    attrText: '{ id=mycontent2 }',
  },
  {
    line: 16,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'cgroup',
  },
  { line: 17, depth: 1, type: 'content', value: '<div>' },
  {
    line: 18,
    depth: 1,
    type: 'content',
    value: 'This is a div-tag and its glorious content',
  },
  { line: 19, depth: 1, type: 'content', value: '</div>' },
  { line: 20, depth: 1, type: 'asideEnd' },
  {
    line: 22,
    depth: 1,
    type: 'asideBlockStart',
    blockType: 'content',
    attrText: '{ id=mycontent3 }',
  },
  {
    line: 23,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'cgroup',
  },
  {
    line: 24,
    depth: 1,
    type: 'content',
    value: '<footer>This is a footer!</footer>',
  },
  { line: 25, depth: 1, type: 'asideEnd' },
];

const intermediateExpanded = {
  frontmatter: {
    title: 'Accumulate from Aside-blocks',
  },
  custom: {},
  contents: [
    {
      type: 'html',
      attributes: {
        id: 'html-block1',
      },
      macroAttributes: {
        content: 'content:mycontent1',
      },
      depth: 1,
      children: [],
      content: '<h1>This is a giant header!</h1>',
    },
    {
      type: 'html',
      attributes: {
        id: 'html-block2',
      },
      macroAttributes: {
        content: 'content:mycontent2',
      },
      depth: 1,
      children: [],
      content:
        '<h1>This is a giant header!</h1>\n' +
        '<div>\n' +
        'This is a div-tag and its glorious content\n' +
        '</div>',
    },
    {
      type: 'html',
      attributes: {
        id: 'html-block3',
      },
      macroAttributes: {
        content: 'content:mycontent3',
      },
      depth: 1,
      children: [],
      content:
        '<h1>This is a giant header!</h1>\n' +
        '<div>\n' +
        'This is a div-tag and its glorious content\n' +
        '</div>\n' +
        '<footer>This is a footer!</footer>',
    },
  ],
};

export default {
  description,
  heedFile,
  tokenized,
  intermediateExpanded,
};
