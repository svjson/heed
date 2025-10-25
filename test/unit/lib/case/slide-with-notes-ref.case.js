import { readAsset } from '../../../fixture.js';

const description = 'block with frontmatter notes ref';

const heedFile = await readAsset(
  import.meta.url,
  './slide-with-notes-ref.heed',
);

const jsonSlide = {
  id: '',
  name: 'Damkör',
  title: 'Malax-Petalax Damkör',
  notes: 'boppe.txt',
  type: 'default',
  custom: {},
  contents: [
    {
      type: 'text',
      text: 'Men vilket namn bildar de här låtarna tillsammans?',
    },
  ],
};

export default {
  description,
  heedFile,
  jsonSlide,
};
