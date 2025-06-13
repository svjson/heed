import fs from 'fs';
import path from 'path';
import { loadPresentation } from '../presentation.js';
import { findSlideFile } from '../slide.js';

const pad = (str, len) => str.padEnd(len);

export const showIndex = async (presentationRoot, presentationFile) => {
  const presentation = await loadPresentation(presentationRoot);
  const rows = [];

  if (presentation.slide) {
    const slidePath = path.join('slides', presentation.slide.id)
    const [fileName, type] = await findSlideFile(presentationRoot, slidePath);

    rows.push({
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

      rows.push({
        section: sectionId,
        slide: slideId,
        path: slidePath,
        type: type || '-'
      });
    };
  }

  // Determine max column widths
  const widths = {
    section: Math.max(...rows.map(r => r.section.length), 'SECTION'.length),
    slide:   Math.max(...rows.map(r => r.slide.length), 'SLIDE ID'.length),
    path:    Math.max(...rows.map(r => r.path.length), 'PATH'.length),
    type:    Math.max(...rows.map(r => r.type.length), 'TYPE'.length)
  };

  // Output header
  console.log(
    pad('SECTION', widths.section), ' ',
    pad('SLIDE ID', widths.slide), ' ',
    pad('PATH', widths.path), ' ',
    pad('TYPE', widths.type)
  );

  // Output rows
  for (const row of rows) {
    console.log(
      pad(row.section, widths.section), ' ',
      pad(row.slide, widths.slide), ' ',
      pad(row.path, widths.path), ' ',
      pad(row.type, widths.type)
    );
  }
}
