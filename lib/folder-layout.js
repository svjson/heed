import { existsSync, statSync } from 'fs';
import path from 'path';
import { readdir } from 'fs/promises';

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

  return {};
}

const NumberedSections = {

  scanSlidesDir: async(path) => {
    const files = (await readdir(path))
      .filter(file => /\.(heed|json)$/.test(file));
    const filteredFiles = files.filter(fileName => {
      if (fileName.toLowerCase().endsWith('.json')) {
        const heedName = fileName.slice(0, -5) + '.heed';
        return !files.includes(heedName);
      }
      return true;
    })
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
      const directories = (await readdir(sectionsPath))
        .filter(file => fs.statSync(filePath)?.isDirectory())

      for (const dir of directories) {
        result.push(NumberedSections.scanSection(path.join(sectionsPath, dir)));
      }
    }

    return result;
  },

  scanSection: async(sectionPath) => {
    const section = {};
    const slides = await NumberedSections.scanSlidesDir(path.join(sectionPath, 'slides'));
    const sections = await NumberedSections.scanSectionsDir(path.join(sectionPath, 'sections'));

    if (slides.length) {
      section.slides = slides;
    }

    if (section.sections) {
      section.sections = sections;
    }

    return section;
  },

  resolveIndex: async(root) => {
    return await NumberedSections.scanSection(root);
  }

}

