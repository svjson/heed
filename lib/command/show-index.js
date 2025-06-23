import { loadPresentation, getIndex } from '../presentation.js';

const pad = (str, len) => str.padEnd(len);

export const showIndex = async (presentationRoot, _presentationFile, opts) => {
  const presentation = await loadPresentation(presentationRoot);

  const slides = await getIndex(presentationRoot, presentation);

  const outputFormat = opts.json ? 'json' : 'table';

  switch (outputFormat) {
  case 'json':
    outputJSON(slides);
    break;
  case 'table':
    outputTable(slides);
    break;
  }
};

const outputJSON = (slides) => {
  console.log(JSON.stringify({ slides: slides }, null, 2));
};

const outputTable = (slides) => {
  // Determine max column widths
  const widths = {
    section: Math.max(...slides.map(r => r.section.length), 'SECTION'.length),
    slide: Math.max(...slides.map(r => r.slide.length), 'SLIDE ID'.length),
    path: Math.max(...slides.map(r => r.path.length), 'PATH'.length),
    type: Math.max(...slides.map(r => r.type.length), 'TYPE'.length)
  };

  // Output header
  console.log(
    pad('SECTION', widths.section), ' ',
    pad('SLIDE ID', widths.slide), ' ',
    pad('PATH', widths.path), ' ',
    pad('TYPE', widths.type)
  );

  // Output slides
  if (!slides.length) {
    console.log('--- No slides in current presentation ---');
    console.log('');
  } else {
    for (const slide of slides) {
      console.log(
        pad(slide.section, widths.section), ' ',
        pad(slide.slide, widths.slide), ' ',
        pad(slide.path, widths.path), ' ',
        pad(slide.type, widths.type)
      );
    }
    console.log('');
  }

};
