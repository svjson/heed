import fs from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';

export const loadPresentation = async (presentationRoot) => {
  const fileName = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(fileName)) {
    throw new Error(`No presentation.json found in ${presentationRoot}`);
  }

  const data = await readFile(fileName, 'utf-8');
  return JSON.parse(data);
}
