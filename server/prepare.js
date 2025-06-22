import path from 'path';

import { HeedServerError } from './error.js';
import { findRoot, loadPresentation } from '../lib/presentation.js';

/**
 * Prepare the presentation by locating the root directory and loading the
 * presentation file.
 *
 * @param {string} relativeRoot - The relative or user-specified path to the
 *                                presentation directory.
 *
 * @returns {Promise<string>} - The absolute path to the presentation root
 *                              directory.
 *
 * @throws {HeedServerError} - If the presentation root cannot be found or if
 *                             there are syntax errors in the presentation file.
 */
export const preparePresentation = async (relativeRoot) => {
  const [presentationRoot] = await findRoot(relativeRoot);

  if (presentationRoot === null) {
    throw new HeedServerError(
      `presentation.json not found in ${path.resolve(relativeRoot)}`,
      'Check your path and make sure that a presentation exists in the specified location.'
    );
  }

  try {
    await loadPresentation(presentationRoot);
  } catch (e) {
    throw new HeedServerError(
      e.message,
      'Check your presentation.json and correct any syntax errors.'
    );
  }

  return presentationRoot;
};

