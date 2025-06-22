import { readAsset } from '../../../fixture.js';

const description = 'with a phases-aside block';

const heedFile = await readAsset(import.meta.url, './simple-with-phases.heed');

const intermediateExpanded = {
  frontmatter: {
    title: 'How to fail - main steps'
  },
  contents: [{
    type: 'text',
    depth: 1,
    attributes: {
      id: 'step1'
    },
    children: [],
    content: '1. Trying'
  }, {
    type: 'text',
    depth: 1,
    attributes: {
      id: 'finish',
      style: 'color: red;'
    },
    children: [],
    content: '2. FAILURE achieved!!'
  }],
  phases: [{
    type: 'phase',
    id: 'initial',
    transitions: {}
  }, {
    type: 'phase',
    id: 'trying',
    transitions: {
      step1: {
        enter: { opacity: '1' },
        rewind: { opacity: '0' }
      }
    }
  }, {
    type: 'phase',
    id: 'failure',
    transitions: {
      finish: {
        enter: { opacity: '1' },
        rewind: { opacity: '0' }
      }
    }
  }]
};

const jsonSlide = {
  id: '',
  name: '',
  title: 'How to fail - main steps',
  notes: '',
  type: 'default',
  contents: [{
    id: 'step1',
    type: 'text',
    text: '1. Trying'
  }, {
    id: 'finish',
    type: 'text',
    styles: {
      color: 'red'
    },
    text: '2. FAILURE achieved!!'
  }],
  steps: [
    { id: 'initial' },
    { id: 'trying', transitions: { step1: [{ opacity: '1' }, { opacity: '0' }]} },
    { id: 'failure', transitions: { finish: [{ opacity: '1' }, { opacity: '0' }]} },
  ]
};

export default {
  description,
  heedFile,
  intermediateExpanded,
  jsonSlide
};
