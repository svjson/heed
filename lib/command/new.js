import path from 'path';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { findRoot } from '../presentation.js';

export const newPresentation = async (name, presentationRoot) => {
  const [root, relRoot] = await findRoot(presentationRoot);
  const targetPath = path.resolve(presentationRoot);
  if (relRoot == '.') {
    throw new Error(`Aborted: There is already a presentation at '${targetPath}'.`);
  }
  if (root || relRoot) {
    throw new Error(`Aborted: The path '${targetPath}' is part of presentation with root '${root}'.`);
  }

  const presentationJsonFile = path.join(targetPath, 'presentation.json');

  const json = {
    name: name,
    plugins: {},
    defaults: {
      appearance: {
        background: '#383838',
        color: '#cecece',
        padding: '80px',
        paddingTop: '50px',
        fontSize: '50px'
      }
    },
    folderLayout: 'numbered-sections'
  };

  if (!existsSync(presentationRoot)) {
    mkdirSync(presentationRoot, { recursive: true });
  }

  await writeFile(presentationJsonFile, JSON.stringify(json, null, 2), 'utf-8');

  const slidesPath = path.join(presentationRoot, 'slides');
  if (!existsSync(path.join(presentationRoot, 'slides'))) {
    mkdirSync(slidesPath);
  }
  const startSlideFile = path.join(slidesPath, 'front.heed');
  const startSlide = `---\ntitle: ${name}}n---\n`;

  await writeFile(startSlideFile, startSlide, 'utf-8');

  return { message: `Created presentation at ${targetPath}.`};
}
