import forMacroBlockCase from './for-macro-block.case';
import { readAsset } from '../../../fixture.js';

const description = '%for-macro block with range';

const heedFile = await readAsset(import.meta.url, './for-macro-block-with-range.heed');

const tokenized = [
  { line: 1, depth: 1, type: 'macroBlockStart', blockType: 'for', attrText: '{ %type=image id=block{n} }' },
  { line: 2, depth: 1, type: 'macroAttr', key: 'each', value: 'n' },
  { line: 3, depth: 1, type: 'macroAttr', key: 'values', value: '1..3' },
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
      values: '1..3'
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

const { intermediateExpanded } = forMacroBlockCase;

export default {
  description,
  heedFile,
  tokenized,
  intermediateBlocks,
  intermediateExpanded
};
