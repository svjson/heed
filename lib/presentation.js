import fs, { readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import { resolveIndex } from './folder-layout/index.js';
import { loadPluginDefinitions } from './plugin.js';
import { findSlideFile } from './slide.js';

/**
 * Load the presentation.json file from directory `presentationRoot`
 *
 * If `opts.resolve` is true, will also resolve the index according to
 * the folder layout strategy specified in the presentation.json.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {Object} opts - Optional parameters.
 * @param {boolean} opts.resolve - If true, will resolve the index.
 * @param {boolean} opts.loadPluginDefs - If true, will load plugin definitions.
 * @return {Promise<Object>} - The loaded presentation object.
 */
export const loadPresentation = async (presentationRoot, opts = {}) => {
  const fileName = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(fileName)) {
    throw new Error(`No presentation.json found in ${presentationRoot}`);
  }

  const data = await readFile(fileName, 'utf-8');
  const presentation = JSON.parse(data);

  if (opts.loadPluginDefs) {
    Object.assign(
      presentation,
      await loadPluginDefinitions(presentationRoot, presentation),
    );
  }

  if (opts.resolve) {
    Object.assign(
      presentation,
      await resolveIndex(presentationRoot, presentation),
    );
  }

  return presentation;
};

/**
 * Round up the slide index of `presentation`, by inspecting folder contents
 * under `presentationRoot`
 */
export const getIndex = async (presentationRoot, presentation) => {
  const slides = [];

  const index = await resolveIndex(presentationRoot, presentation);

  if (index.slide) {
    const slidePath = 'slides';
    const [_fileName, type] = await findSlideFile(
      presentationRoot,
      path.join(slidePath, presentation.slide.id),
    );

    slides.push({
      section: '-',
      slide: presentation.slide.id,
      path: slidePath,
      type: type || '-',
    });
  }
  if (Array.isArray(index.slides)) {
    for (const slide of index.slides) {
      const slidePath = 'slides';
      const [_fileName, type] = await findSlideFile(
        presentationRoot,
        path.join(slidePath, slide.id),
      );

      slides.push({
        section: '-',
        slide: slide.id,
        path: slidePath,
        type: type || '-',
      });
    }
  }

  if (Array.isArray(index.sections)) {
    for (const section of index.sections) {
      const sectionId = section.id;
      for (const slide of section?.slides ?? []) {
        const slideId = slide.id;
        const slidePath = path.join('sections', sectionId, 'slides');
        const [_fileName, type] = await findSlideFile(
          presentationRoot,
          path.join(slidePath, slideId),
        );

        slides.push({
          section: sectionId,
          slide: slideId,
          path: slidePath,
          type: type || '-',
        });
      }
    }
  }

  return slides;
};

/**
 * Locate the presentation root directory, starting at dir.
 * Returns a tuple containing [absolutePath, relativePath], or [null, null]
 * if no presentation root can be found.
 */
export const findRoot = async (dir) => {
  const absolute = path.resolve(dir);
  if (fs.existsSync(path.join(absolute, 'presentation.json'))) {
    return [absolute, dir];
  }

  const parentDir = path.dirname(absolute);
  if (path.dirname(parentDir) !== parentDir) {
    if (parentDir !== absolute) {
      return await findRoot(path.join(dir, '..'));
    }
  }

  return [null, null];
};

/**
 * Recursively search for the presentation root directory starting from `dir`.
 *
 * This should not be used for locating presentations on paths supplied by the user
 * Chiefly used to search for presentations in extracted archives.
 *
 * @param {string} dir - The directory to start searching from.
 * @param {number} maxDepth - The maximum depth to search for the root directory.
 *
 * @return {Promise<string|null>} - Returns the absolute path to the root directory
 */
export const findRootRecursive = async (dir, maxDepth = 5) => {
  const absolute = path.resolve(dir);
  if (fs.existsSync(path.join(absolute, 'presentation.json'))) {
    return absolute;
  }

  if (maxDepth === 1 || !fs.existsSync(absolute)) {
    return null;
  }

  const contents = readdirSync(dir, { withFileTypes: true });
  for (const ent of contents) {
    if (ent.isDirectory()) {
      const root = await findRootRecursive(
        path.join(dir, ent.name),
        maxDepth - 1,
      );
      if (root) {
        return root;
      }
    }
  }

  return null;
};

/**
 * Add a plugin configuration to the presentation.json file located
 * in `presentationRoot`.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {Object} presJson - The presentation JSON object.
 * @param {string} pluginName - The name of the plugin to add.
 * @param {Object} config - The configuration object for the plugin.
 *
 * @return {Promise<void>} - A promise that resolves when the configuration is added.
 */
export const addPluginConfiguration = async (
  presentationRoot,
  presJson,
  pluginName,
  config,
) => {
  presJson.plugins = presJson.plugins || {};
  presJson.plugins[pluginName] = config;
  await savePresentationDotJson(presentationRoot, presJson);
};

/**
 * Create a default presentation.json file in `targetDir`, with the
 * presentation name `name`.
 */
export const createPresentationDotJson = async (targetDir, name) => {
  await savePresentationDotJson(targetDir, {
    name: name,
    plugins: {},
    defaults: {
      appearance: {
        background: '#383838',
        color: '#cecece',
        padding: '80px',
        paddingTop: '50px',
        fontSize: '50px',
      },
    },
    folderLayout: 'numbered-sections',
  });
};

/**
 * Save `content` to presentation.json` in `targetDir`.
 */
export const savePresentationDotJson = async (targetDir, content) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursie: true });
  }
  const presentationJsonFile = path.join(targetDir, 'presentation.json');
  await writeFile(
    presentationJsonFile,
    JSON.stringify(content, null, 2),
    'utf-8',
  );
};
