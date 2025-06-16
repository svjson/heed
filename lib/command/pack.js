import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import { createArchive, resolveArchiveCommand, sanitizeFilename } from '../archive.js';
import { loadPresentation } from '../presentation.js';

const EXCLUDE_ITEMS = [
  '.git',
  '.git/*',
  '.gitignore',
  'node_modules',
  'node_modules/*',
  'plugins/*',
  '.cache',
  '.cache/*',
  '.DS_Store',
  '.vscode',
  '.vscode/*',
  '.idea',
  '.idea/*',
  'dist'
];

/**
 * Create an archive of the presentation at `presentationRoot` in the `./dist/`
 * directory.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {Object} options - Options for the archive creation.
 * @param {string} options.type - The type of archive to create (e.g., 'zip', 'tar').
 *
 * @return {Promise<Object>} - An object containing the message and file name of the created archive.
 */
export const pack = async (
  presentationRoot,
  options
) => {
  const archiveCommand = resolveArchiveCommand(options.type);
  const presentation = await loadPresentation(presentationRoot);
  const distDir = path.join(presentationRoot, 'dist');
  if (!existsSync(distDir)) {
    await mkdir(distDir);
  }
  const fileName = `${sanitizeFilename(presentation.name) ?? 'presentation'}.heed.${options.type}`;
  await createArchive(archiveCommand, path.join(distDir, fileName), {
    cwd: presentationRoot,
    type: options.type,
    exclude: [fileName, ...EXCLUDE_ITEMS]
  });

  return {
    message: `Created archive '${fileName}'`,
    fileName,
  }
}
