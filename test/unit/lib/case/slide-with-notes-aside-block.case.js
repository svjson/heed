
import { readAsset } from '../../../fixture.js';

const description = 'slide with notes aside block';

const heedFile = await readAsset(import.meta.url, 'slide-with-notes-aside-block.heed');

const tokenized = [
  { line: 5, depth: 1, type: 'blockStart', blockType: 'text', attrText: '' },
  { line: 6, depth: 1, type: 'content', value: 'Every slice of toast is now immutably recorded on the blockchain.'},
  { line: 7, depth: 1, type: 'blockEnd', data: '--' },

  { line: 9, depth: 1, type: 'asideBlockStart', blockType: 'notes', attrText: '' },
  { line: 10, depth: 1, type: 'content', value: 'Points to drive home:'},
  { line: 11, depth: 1, type: 'content', value: '- Regular crypto scams are becoming less and less lucrative.' },
  { line: 12, depth: 1, type: 'content', value: '- Most people stop listening immediately when they hear "block chain".'},
  { line: 13, depth: 1, type: 'content', value: '- Everybody likes toast' },
  { line: 14, depth: 1, type: 'content', value: '- Toast is the new crypto scam.'},
  { line: 15, depth: 1, type: 'asideEnd' },
];

const intermediate = {
  frontmatter: {
    id: '04-toast-protocol',
    title: 'The Distributed Ledger of Breakfast'
  },
  contents: [{
    type: 'text',
    attributes: {},
    depth: 1,
    children: [],
    content: 'Every slice of toast is now immutably recorded on the blockchain.'
  }],
  notes: [{
    type: 'text',
    source: 'Slide',
    content: [
      'Points to drive home:',
      '- Regular crypto scams are becoming less and less lucrative.',
      '- Most people stop listening immediately when they hear "block chain".',
      '- Everybody likes toast',
      '- Toast is the new crypto scam.'
    ].join('\n')
  }]
};

const jsonSlide = {
  id: '04-toast-protocol',
  title: 'The Distributed Ledger of Breakfast',
  notes: '',
  name: '',
  type: 'default',
  contents: [{
    type: 'text',
    text: 'Every slice of toast is now immutably recorded on the blockchain.'
  }]
};

export default {
  description,
  heedFile,
  tokenized,
  intermediate,
  jsonSlide,
};

