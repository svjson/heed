import crypto from 'crypto';
import { existsSync, mkdirSync, rmSync, statSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

import envPaths from 'env-paths';

import { HeedServerError } from './error.js';
import { extractArchive, isArchive } from '../lib/archive.js';
import { installPlugins } from '../lib/plugin.js';
import { findRoot, findRootRecursive, loadPresentation } from '../lib/presentation.js';

/**
 * Prepare the presentation by locating the root directory and loading the
 * presentation file.
 *
 * @param {string} relativeRoot - The relative or user-specified path to the
 *                                presentation directory.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing
 *                              the presentation root directory.
 *
 * @throws {HeedServerError} - If the presentation root cannot be found or if
 *                             there are syntax errors in the presentation file.
 */
const verifyDirectory = async (relativeRoot) => {
  const [presentationRoot] = await findRoot(relativeRoot);

  if (presentationRoot === null) {
    throw new HeedServerError(
      `presentation.json not found in '${absolutePath}'.`,
      'Check your path and make sure that a presentation exists in the specified location.'
    );
  }

  try {
    const presentation = await loadPresentation(presentationRoot);
    return {
      presentationName: presentation.name,
      presentationRoot
    };
  } catch (e) {
    throw new HeedServerError(
      e.message,
      'Check your presentation.json and correct any syntax errors.'
    );
  }
};

/**
 * Prepare the presentation archive by extracting it to a cache directory
 * and verifying its contents.
 *
 * The cache directory will be placed in an appropriate location for the OS,
 * relying on `env-paths` to resolve these. On POSIX systems this will be
 * under ~/.cache/ and on Windows somewhere akin to `C:\Users\USERNAME\AppData\Local\`.
 *
 * After successful extraction, heed will attempt to install all plugins used
 * by the presentation.
 *
 * After a successful installation and verification of the presentation, a
 * .heedsuccess-file will be placed in the extracted folder. If this file is found
 * on subsequent attempts to serve the same presentation, the extraction/installation
 * process will be skipped.
 *
 * @param {string} absolutePath - The absolute path to the presentation archive.
 * @param {string} heedRoot - The root directory for the heedjs package, required
 *                            for plugin installation.
 * @return {Promise<Object>} - A promise that resolves to an object containing
 */
const preparePresentationArchive = async (absolutePath, heedRoot) => {
  const heedPaths = envPaths('heedjs', { suffix: ''});
  const hash = crypto.createHash('sha1').update(absolutePath).digest('hex');
  const cacheRoot = path.join(heedPaths.cache, 'archives');
  const extractPath = path.join(cacheRoot, hash);
  const successFile = path.join(extractPath, '.heedsuccess');

  if (!existsSync(cacheRoot)) {
    mkdirSync(cacheRoot, { recursive: true });
  }

  if (!existsSync(successFile)) {
    try {
      if (existsSync(extractPath)) {
        rmSync(extractPath, { recursive: true });
      }

      if (!existsSync(extractPath)) {
        mkdirSync(extractPath, { recursive: true });
      }

      await extractArchive(absolutePath, extractPath);
      const presentationRoot = await findRootRecursive(extractPath);
      if (!presentationRoot) {
        rmSync(extractPath, { recursive: true });
        throw new HeedServerError(
          `Could not find a valid presentation in archive '${absolutePath}'`,
          'Ensure the archive contains a Heed-compatible presentation (e.g. with a presentation.json)'
        );
      }

      const presentation = await loadPresentation(presentationRoot);
      await installPlugins(presentationRoot, presentation, heedRoot);
      await writeFile(successFile, 'true', 'utf-8');

      return {
        presentationRoot: presentationRoot,
        presentationName: presentation.name,
        archiveFile: absolutePath
      };
    } catch (e) {
      if (e instanceof HeedServerError) {
        throw e;
      }
      throw new HeedServerError(
        `Unable to serve presentation archive: ${e}`
      );
    }
  }

  try {
    const presentationRoot = await findRootRecursive(extractPath);
    const presentation = await loadPresentation(presentationRoot);

    return {
      presentationRoot: presentationRoot,
      presentationName: presentation.name,
      archiveFile: absolutePath
    };
  } catch (e) {
    rmSync(extractPath, { recursive: true});
    return await preparePresentationArchive(absolutePath, heedRoot);
  }
};

/**
 * Prepare the presentation by locating the root directory or extracting
 * the archive file pointed to by `relativeRoot`.
 *
 * @param {string} relativeRoot - The relative or user-specified path to the
 *                                presentation directory or archive file.
 * @param {string} heedRoot  - The root directory for the heedjs package.
 * @return {Promise<Object>} - A promise that resolves to an object containing
 *                             the presentation root directory and, if applicable,
 *                             the archive file name.
 * @throws {HeedServerError} - If the path does not exist, is not a presentation dir,
 *                             is not a supported archive file, or if the archive file
 *                             does not contain a valid presentation.
 */
export const preparePresentation = async (relativeRoot, heedRoot) => {
  const absolutePath = path.resolve(relativeRoot);
  if (!existsSync(absolutePath)) {
    throw new HeedServerError(
      `The path '${absolutePath}' does not exist.`,
      'Check your path and make sure that a presentation exists in the specified location.'
    );
  }

  const pathStat = statSync(absolutePath);

  if (pathStat.isDirectory()) {
    return await verifyDirectory(relativeRoot);
  }

  if (pathStat.isFile()) {
    const fileName = path.basename(absolutePath);
    if (fileName === 'presentation.json') {
      return await verifyDirectory(path.dirname(absolutePath));
    }

    if (isArchive(fileName)) {
      return await preparePresentationArchive(absolutePath, heedRoot);
    }
  }

  throw new HeedServerError(
    `Cannot serve '${absolutePath}'.`,
    'If the file is an archive-file, make sure it is of a supported format and with a known extension (.zip, .tar, .tgz, .tar.gz)'
  );
};

