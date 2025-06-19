
import { readAsset } from '../../../fixture.js';

const description = 'only a frontmatter header';

const heedFile = await readAsset(import.meta.url, './frontmatter-only.heed');

const intermediateExpanded = {
  frontmatter: {
    id: 'header-only',
    title: 'There is a title, though!',
    type: 'default'
  },
  contents: []
};

export default {
  description,
  heedFile,
  intermediateExpanded
};
