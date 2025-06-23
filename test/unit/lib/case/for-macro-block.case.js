import { readAsset } from '../../../fixture.js';

const description = '%for-macro block';

const heedFile = await readAsset(import.meta.url, './for-macro-block.heed');

const tokenized = [
  { line: 1, depth: 1, type: 'macroBlockStart', blockType: 'for', attrText: '{ %type=image id=block{n} }' },
  { line: 2, depth: 1, type: 'macroAttr', key: 'each', value: 'n' },
  { line: 3, depth: 1, type: 'macroAttr', key: 'values', value: '1,2,3' },
  { line: 4, depth: 1, type: 'attr', key: 'source', value: 'image{n}.png' },
  { line: 5, depth: 1, type: 'attr', key: 'style', value: 'opacity: 1;' },
  { line: 6, depth: 1, type: 'blockEnd', data: '--' }
];

const intermediateBlocks = [
  {
    blockType: 'macro',
    type: 'for',
    macroAttributes: {
      type: 'image',
      each: 'n',
      values: '1,2,3'
    },
    attributes: {
      id: 'block{n}',
      source: 'image{n}.png',
      style: 'opacity: 1;'
    },
    content: '',
    children: [],
    depth: 1
  }
];

const intermediateExpanded = {
  frontmatter: {},
  contents: [{
    type: 'image',
    depth: 1,
    attributes: {
      id: 'block1',
      source: 'image1.png',
      style: 'opacity: 1;',
    },
    macroAttributes: {},
    children: [],
    content: ''
  }, {
    type: 'image',
    depth: 1,
    attributes: {
      id: 'block2',
      source: 'image2.png',
      style: 'opacity: 1;',
    },
    macroAttributes: {},
    children: [],
    content: ''
  }, {
    type: 'image',
    depth: 1,
    macroAttributes: {},
    attributes: {
      id: 'block3',
      source: 'image3.png',
      style: 'opacity: 1;',
    },
    children: [],
    content: ''
  }]
};

const jsonSlide = {
  id: '',
  name: '',
  notes: '',
  type: 'default',
  contents: [{
    type: 'image',
    id: 'block1',
    source: 'image1.png',
    styles: {
      opacity: '1'
    }
  }, {
    type: 'image',
    id: 'block2',
    source: 'image2.png',
    styles: {
      opacity: '1'
    }
  }, {
    type: 'image',
    id: 'block3',
    source: 'image3.png',
    styles: {
      opacity: '1'
    }
  }]
};

export default {
  description,
  heedFile,
  tokenized,
  intermediateBlocks,
  intermediateExpanded,
  jsonSlide
};
