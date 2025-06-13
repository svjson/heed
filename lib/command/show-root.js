import path from 'path';

import { findRoot } from '../presentation.js';

export const showRoot = async (dir, options) => {
  const [absoluteRoot, relativeRoot] = await findRoot(dir);

  if (options.json) {
    console.log(JSON.stringify({ relativeRoot, absoluteRoot }, null, 2));
  } else {
    if (!relativeRoot) {
      console.error(`No presentation.json found in '${path.resolve(dir)}' or any of its parent directories.`);
    } else {
      console.log('Relative root: ', relativeRoot);
      console.log('Absolute root: ', absoluteRoot);
    }
  }
}
