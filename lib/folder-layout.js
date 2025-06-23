import { existsSync, statSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

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
export const resolveIndex = async (root, presentation) => {
  if (!presentation.folderLayout && (presentation.slide
    || Array.isArray(presentation.slides)
    || Array.isArray(presentation.sections))) {
    const { slide, slides, sections } = presentation;
    return { slide, slides, sections };
  }

  switch (presentation.folderLayout) {
  case 'numbered-sections':
  default:
    return await NumberedSections.resolveIndex(root);
  }
};

/**
 * Implementation of the `numbered-sections` folder layout.
 *
 * Recursively scans the presentation directory according to
 * the following layout scheme:
 *
 * slides/
 * sections/
 *   - <section-name>/slides/
 *   - <section-name>/sections/
 *     ..etc
 */
export const NumberedSections = {

  scanSlidesDir: async(path) => {
    if (!existsSync(path)) return [];
    const files = (await readdir(path))
      .filter(file => /\.(heed|json)$/.test(file));
    const filteredFiles = files.filter(fileName => {
      if (fileName.toLowerCase().endsWith('.json')) {
        const heedName = fileName.slice(0, -5) + '.heed';
        return !files.includes(heedName);
      }
      return true;
    });
    return filteredFiles.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return 0;
    }).map(file => ({
      id: file.slice(0, -5)
    }));
  },

  scanSectionsDir: async (sectionsPath) => {
    const result = [];

    if (existsSync(sectionsPath)) {
      const directories = (await readdir(sectionsPath, { withFileTypes: true }));

      for (const dir of directories) {
        if (dir.isDirectory) {
          result.push(await NumberedSections.scanSection(path.join(sectionsPath, dir.name)));
        }
      }
    }

    return result;
  },

  scanSection: async(sectionPath, isRoot) => {
    const section = isRoot ? {} : { id: path.basename(sectionPath)};
    const slides = await NumberedSections.scanSlidesDir(path.join(sectionPath, 'slides'));
    const sections = await NumberedSections.scanSectionsDir(path.join(sectionPath, 'sections'));

    if (slides.length) {
      section.slides = slides;
    }

    if (sections.length) {
      section.sections = sections;
    }

    return section;
  },

  resolveIndex: async(root) => {
    return await NumberedSections.scanSection(root, true);
  }

};

