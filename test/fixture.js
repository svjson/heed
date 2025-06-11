import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

export const readAsset = async (meta, relativePath) => {
  return await readFile(path.resolve(path.dirname(fileURLToPath(meta)), relativePath), 'utf-8');
}
