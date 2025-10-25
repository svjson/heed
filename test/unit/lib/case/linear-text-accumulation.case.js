import { readAsset } from '../../../fixture';

const description = 'text blocks with single content accumulation group';

const heedFile = await readAsset(
  import.meta.url,
  './linear-text-accumulation.heed',
);

const tokenized = [
  { line: 1, depth: 1, type: 'blockStart', blockType: 'text', attrText: '' },
  {
    line: 2,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'arbitrary-name',
  },
  { line: 3, depth: 1, type: 'content', value: 'There are no houses' },
  { line: 4, depth: 1, type: 'blockEnd', data: '--' },

  { line: 6, depth: 1, type: 'blockStart', blockType: 'text', attrText: '' },
  {
    line: 7,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'arbitrary-name',
  },
  { line: 8, depth: 1, type: 'content', value: 'in New Orleans' },
  { line: 9, depth: 1, type: 'blockEnd', data: '--' },

  { line: 11, depth: 1, type: 'blockStart', blockType: 'text', attrText: '' },
  {
    line: 12,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'arbitrary-name',
  },
  {
    line: 13,
    depth: 1,
    type: 'content',
    value: 'and they call absolutely none of them',
  },
  { line: 14, depth: 1, type: 'blockEnd', data: '--' },

  { line: 16, depth: 1, type: 'blockStart', blockType: 'text', attrText: '' },
  {
    line: 17,
    depth: 1,
    type: 'macroAttr',
    key: 'accumulate.content',
    value: 'arbitrary-name',
  },
  { line: 18, depth: 1, type: 'content', value: 'The Rising Sun' },
  { line: 19, depth: 1, type: 'blockEnd', data: '--' },
];

const intermediateExpanded = {
  frontmatter: {},
  custom: {},
  contents: [
    {
      type: 'text',
      attributes: {},
      macroAttributes: {
        'accumulate.content': 'arbitrary-name',
      },
      depth: 1,
      children: [],
      content: 'There are no houses',
    },
    {
      type: 'text',
      attributes: {},
      macroAttributes: {
        'accumulate.content': 'arbitrary-name',
      },
      depth: 1,
      children: [],
      content: 'There are no houses\n' + 'in New Orleans',
    },
    {
      type: 'text',
      attributes: {},
      macroAttributes: {
        'accumulate.content': 'arbitrary-name',
      },
      depth: 1,
      children: [],
      content:
        'There are no houses\n' +
        'in New Orleans\n' +
        'and they call absolutely none of them',
    },
    {
      type: 'text',
      attributes: {},
      macroAttributes: {
        'accumulate.content': 'arbitrary-name',
      },
      depth: 1,
      children: [],
      content:
        'There are no houses\n' +
        'in New Orleans\n' +
        'and they call absolutely none of them\n' +
        'The Rising Sun',
    },
  ],
};

export default {
  description,
  heedFile,
  tokenized,
  intermediateExpanded,
};
