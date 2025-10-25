import { readAsset } from '../../../fixture.js';

const description = 'block with broken frontmatter notes ref';

const heedFile = await readAsset(
  import.meta.url,
  './slide-with-broken-notes-ref.heed',
);

const jsonSlide = {
  id: '69-flamingo-surge',
  name: 'Flamingo Surge',
  title: 'Quantum Flamingos and the Elasticity of Time',
  notes: 'flaming-mungo.txt',
  type: 'default',
  custom: {},
  contents: [
    {
      type: 'text',
      text: [
        'When the flamingos began moonwalking backwards through the the wormhome,',
        "we knew - we just knew - PowerPoint wasn't going to be enough.",
      ].join('\n'),
    },
  ],
};

export default {
  description,
  heedFile,
  jsonSlide,
};
