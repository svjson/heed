import fs from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';

import { findSlideFile } from './slide.js';

export const loadPresentation = async (presentationRoot) => {
  const fileName = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(fileName)) {
    throw new Error(`No presentation.json found in ${presentationRoot}`);
  }

  const data = await readFile(fileName, 'utf-8');
  return JSON.parse(data);
}


export const getIndex = async (presentationRoot, presentation) => {
  const slides = [];

  if (presentation.slide) {
    const slidePath = path.join('slides', presentation.slide.id)
    const [fileName, type] = await findSlideFile(presentationRoot, slidePath);

    slides.push({
      section: '-',
      slide: presentation.slide.id,
      path: slidePath,
      type: type || '-'
    });
  }
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

  return slides;
}
