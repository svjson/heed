import path from 'path';

import numberedSections from './numbered-sections.js';

/**
 * Resolve the index of a presentation based on its folder layout,
 * unless the presentation is using an explicitly defined index,
 * in which case that is returned.
 *
 * @param {string} root - The root directory of the presentation.
 * @param {Object} presentation - The presentation object containing metadata.
 *
 * @return {Promise<Object>} - A promise that resolves to an object containing
 *                             the resolved index of the presentation.
 */
export const resolveIndex = async (root, presentation, opts) => {
  if (
    !presentation.folderLayout &&
    (presentation.slide ||
      Array.isArray(presentation.slides) ||
      Array.isArray(presentation.sections))
  ) {
    const { slide, slides, sections } = presentation;
    return { slide, slides, sections };
  }

  switch (presentation.folderLayout) {
  case 'numbered-sections':
  default:
    return await numberedSections.resolveIndex(root, opts);
  }
};

export const resolveDirContext = async (rootDir, index, dir) => {
  const queryPath = path.relative(
    path.resolve(rootDir),
    path.resolve(rootDir, dir),
  );
  const thread = [];
  const sectionPath = (index.sections ?? []).reduce((sPath, section) => {
    if (queryPath.startsWith(section.path)) {
      if (!sPath) sPath = section.path;
      else if (section.path.length > sPath.length) {
        sPath = section.path;
      }
    }
    return sPath;
  }, null);
  if (sectionPath) {
    thread.push(...sectionPath.split(path.sep));
  }

  return { type: thread.length ? 'section' : 'root', thread };
};
