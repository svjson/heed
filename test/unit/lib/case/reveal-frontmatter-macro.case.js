import { readAsset } from '../../../fixture.js';

const description =
  'several html-blocks, revealed step-by-step through %reveal-macro';

const heedFile = await readAsset(
  import.meta.url,
  './reveal-frontmatter-macro.heed',
);

const tokenized = [
  {
    line: 6,
    depth: 1,
    type: 'blockStart',
    blockType: 'html',
    attrText: '{ id=bull1 }',
  },
  { line: 7, depth: 1, type: 'content', value: '<b>1.</b> Install Emacs' },
  { line: 8, depth: 1, type: 'blockEnd', data: '--' },

  {
    line: 10,
    depth: 1,
    type: 'blockStart',
    blockType: 'html',
    attrText: '{ id=bull2 }',
  },
  {
    line: 11,
    depth: 1,
    type: 'content',
    value: '<b>2.</b> Discover that tinkering with your configuration...',
  },
  { line: 12, depth: 1, type: 'blockEnd', data: '--' },

  {
    line: 14,
    depth: 1,
    type: 'blockStart',
    blockType: 'html',
    attrText: '{ id=bull2a }',
  },
  { line: 15, depth: 1, type: 'attr', key: 'style', value: 'font-size: 15px;' },
  { line: 16, depth: 1, type: 'content', value: '<b>a)</b> Sparks joy!' },
  { line: 17, depth: 1, type: 'blockEnd', data: '--' },

  {
    line: 19,
    depth: 1,
    type: 'blockStart',
    blockType: 'html',
    attrText: '{ id=bull2b }',
  },
  { line: 20, depth: 1, type: 'attr', key: 'style', value: 'font-size: 15px;' },
  {
    line: 21,
    depth: 1,
    type: 'content',
    value: '<b>b)</b> Never ever (ever) ends...',
  },
  { line: 22, depth: 1, type: 'blockEnd', data: '--' },

  {
    line: 24,
    depth: 1,
    type: 'blockStart',
    blockType: 'html',
    attrText: '{ id=bull3 }',
  },
  {
    line: 25,
    depth: 1,
    type: 'content',
    value: '<b>3.</b> Everlasting joy has been achieved!',
  },
  { line: 26, depth: 1, type: 'blockEnd', data: '--' },
];

const intermediate = {
  frontmatter: {
    title: 'Steps toward everlasting joy',
    '%reveal': 'all',
    '%reveal.style': 'opacity: 1 | 0;',
  },
  custom: {},
  contents: [
    {
      type: 'html',
      attributes: { id: 'bull1' },
      content: '<b>1.</b> Install Emacs',
      children: [],
      depth: 1,
    },
    {
      type: 'html',
      attributes: { id: 'bull2' },
      content: '<b>2.</b> Discover that tinkering with your configuration...',
      children: [],
      depth: 1,
    },
    {
      type: 'html',
      attributes: { id: 'bull2a', style: 'font-size: 15px;' },
      content: '<b>a)</b> Sparks joy!',
      children: [],
      depth: 1,
    },
    {
      type: 'html',
      attributes: { id: 'bull2b', style: 'font-size: 15px;' },
      content: '<b>b)</b> Never ever (ever) ends...',
      children: [],
      depth: 1,
    },
    {
      type: 'html',
      attributes: { id: 'bull3' },
      content: '<b>3.</b> Everlasting joy has been achieved!',
      children: [],
      depth: 1,
    },
  ],
};

const intermediateExpanded = {
  frontmatter: {
    title: 'Steps toward everlasting joy',
  },
  custom: {},
  contents: intermediate.contents,
  phases: [
    {
      type: 'phase',
      id: 'initial',
      transitions: {},
    },
    {
      type: 'phase',
      id: 'phase1',
      transitions: {
        bull1: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' },
        },
      },
    },
    {
      type: 'phase',
      id: 'phase2',
      transitions: {
        bull2: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' },
        },
      },
    },
    {
      type: 'phase',
      id: 'phase3',
      transitions: {
        bull2a: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' },
        },
      },
    },
    {
      type: 'phase',
      id: 'phase4',
      transitions: {
        bull2b: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' },
        },
      },
    },
    {
      type: 'phase',
      id: 'phase5',
      transitions: {
        bull3: {
          enter: { opacity: '1' },
          rewind: { opacity: '0' },
        },
      },
    },
  ],
};

export default {
  description,
  heedFile,
  tokenized,
  intermediate,
  intermediateBlocks: intermediate.contents,
  intermediateExpanded,
};
