import { readAsset } from '../../../fixture.js';

const description = 'column-layout block with children';

const heedFile = await readAsset(import.meta.url, './column-layout-block.heed');

const tokenized = [
  {
    line: 1,
    depth: 1,
    type: 'blockStart',
    blockType: 'column-layout',
    attrText: '',
  },

  { line: 2, depth: 2, type: 'blockStart', blockType: 'column', attrText: '' },

  { line: 3, depth: 3, type: 'blockStart', blockType: 'html', attrText: '' },
  { line: 4, depth: 3, type: 'attr', key: 'style', value: 'font-size: 40px' },
  { line: 5, depth: 3, type: 'content', value: '<h1>This is column 1</h1>' },
  { line: 6, depth: 3, type: 'blockEnd', data: '--' },

  { line: 7, depth: 3, type: 'blockStart', blockType: 'image', attrText: '' },
  {
    line: 8,
    depth: 3,
    type: 'attr',
    key: 'src',
    value: 'column-one-image.jpg',
  },
  { line: 9, depth: 3, type: 'blockEnd', data: '--' },

  { line: 10, depth: 2, type: 'blockEnd', data: '--' },

  { line: 11, depth: 2, type: 'blockStart', blockType: 'column', attrText: '' },
  { line: 12, depth: 3, type: 'blockStart', blockType: 'html', attrText: '' },
  { line: 13, depth: 3, type: 'attr', key: 'style', value: 'font-size: 20px' },
  { line: 14, depth: 3, type: 'content', value: '<h2>This is column 2</h2>' },
  { line: 15, depth: 3, type: 'blockEnd', data: '--' },

  { line: 16, depth: 3, type: 'blockStart', blockType: 'text', attrText: '' },
  {
    line: 17,
    depth: 3,
    type: 'content',
    value: 'This could be a long-winded tale about column 2,',
  },
  { line: 18, depth: 3, type: 'content', value: "but isn't." },
  { line: 19, depth: 3, type: 'blockEnd', data: '--' },

  { line: 20, depth: 2, type: 'blockEnd', data: '--' },
  { line: 21, depth: 1, type: 'blockEnd', data: '--' },
];

const intermediateBlocks = [
  {
    type: 'column-layout',
    attributes: {},
    content: '',
    children: [
      {
        type: 'column',
        attributes: {},
        content: '',
        depth: 2,
        children: [
          {
            type: 'html',
            attributes: {
              style: 'font-size: 40px',
            },
            content: '<h1>This is column 1</h1>',
            depth: 3,
            children: [],
          },
          {
            type: 'image',
            attributes: {
              src: 'column-one-image.jpg',
            },
            content: '',
            depth: 3,
            children: [],
          },
        ],
      },
      {
        type: 'column',
        attributes: {},
        content: '',
        depth: 2,
        children: [
          {
            type: 'html',
            attributes: {
              style: 'font-size: 20px',
            },
            content: '<h2>This is column 2</h2>',
            depth: 3,
            children: [],
          },
          {
            type: 'text',
            attributes: {},
            content:
              "This could be a long-winded tale about column 2,\nbut isn't.",
            depth: 3,
            children: [],
          },
        ],
      },
    ],
    depth: 1,
  },
];

const intermediate = {
  frontmatter: {},
  custom: {},
  contents: intermediateBlocks,
};

const jsonSlide = {
  id: '',
  name: '',
  notes: '',
  type: 'default',
  custom: {},
  contents: [
    {
      type: 'column-layout',
      columns: [
        {
          type: 'column',
          contents: [
            {
              type: 'html',
              styles: {
                'font-size': '40px',
              },
              html: '<h1>This is column 1</h1>',
            },
            {
              type: 'image',
              source: 'column-one-image.jpg',
            },
          ],
        },
        {
          type: 'column',
          contents: [
            {
              type: 'html',
              styles: {
                'font-size': '20px',
              },
              html: '<h2>This is column 2</h2>',
            },
            {
              type: 'text',
              text: "This could be a long-winded tale about column 2,\nbut isn't.",
            },
          ],
        },
      ],
    },
  ],
};

export default {
  description,
  heedFile,
  tokenized,
  intermediate,
  intermediateBlocks,
  jsonSlide,
};
