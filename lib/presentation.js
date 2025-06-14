import fs from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';

import { findSlideFile } from './slide.js';
import { resolveIndex } from './folder-layout.js'

/**
 * Load the presentation.json file from directory `presentationRoot`
 */
export const loadPresentation = async (presentationRoot, opts = {}) => {
  const fileName = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(fileName)) {
    throw new Error(`No presentation.json found in ${presentationRoot}`);
  }

  const data = await readFile(fileName, 'utf-8');
  const presentation = JSON.parse(data)
  if (opts.resolve) {
    Object.assign(presentation, await resolveIndex(presentationRoot, presentation));
  }

  return presentation;
}

/**
 * Round up the slide index of `presentation`, by inspecting folder contents
 * under `presentationRoot`
 */
export const getIndex = async (presentationRoot, presentation) => {
  const slides = [];

  const index = await resolveIndex(presentationRoot, presentation);

  if (index.slide) {
    const slidePath = 'slides';
    const [fileName, type] = await findSlideFile(presentationRoot, path.join(slidePath, presentation.slide.id));

    slides.push({
      section: '-',
      slide: presentation.slide.id,
      path: slidePath,
      type: type || '-'
    });
  }
  if (Array.isArray(index.slides)) {
    for (const slide of index.slides) {
      const slidePath = 'slides';
      const [fileName, type] = await findSlideFile(presentationRoot, path.join(slidePath, slide.id));

      slides.push({
        section: '-',
        slide: slide.id,
        path: slidePath,
        type: type || '-'
      });
    }
  }

  if (Array.isArray(index.sections)) {
    for (const section of presentation.sections) {
      const sectionId = section.id;
      for (const slide of section.slides) {
        const slideId = slide.id;
        const slidePath = path.join('sections', sectionId);
        const [fileName, type] = await findSlideFile(presentationRoot, path.join(slidePath, slideId));

        slides.push({
          section: sectionId,
          slide: slideId,
          path: slidePath,
          type: type || '-'
        });
      };
    }
  }

  return slides;
}

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
}
