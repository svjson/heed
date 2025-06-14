import path from 'path';

import { createPresentationDotJson, findRoot } from '../presentation.js';
import { createSlide } from '../slide.js';

export const newPresentation = async (name, presentationRoot) => {
  const [root, relRoot] = await findRoot(presentationRoot);
  const targetPath = path.resolve(presentationRoot);
  if (relRoot == '.') {
    throw new Error(`Aborted: There is already a presentation at '${targetPath}'.`);
  }
  if (root || relRoot) {
    throw new Error(`Aborted: The path '${targetPath}' is part of presentation with root '${root}'.`);
  }

  await createPresentationDotJson(targetPath, name);

  const startSlideFile = path.join(targetPath, 'slides', 'front.heed');
  await createSlide(startSlideFile, { title: name });

  return { message: `Created presentation at ${targetPath}.`};
}
