import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

/**
 * Implementation of the `numbered-sections` folder layout.
 *
 * This layout assumes sections and slides are sequentially
 * numbered, and auto-resolves the slide deck index by walking
 * the folder structure and ordering components by their leading
 * number
 *
 * - slides/
 * - sections/
 *     - <01-section-name>/slides/
 *         - <01-slide-name>.heed
 *         - <02-slide-name>.json
 *     - <02-section-name>/sections/
 *  ..etc
 */
const layoutName = 'numbered-sections';

/**
 * Recursively scans the presentation directory according to
 * the layout scheme.
 *
 * This layout considers the root presentation folder to
 * be a section itself.
 *
 * @param {string} root - The root path of the presentation.
 */
export const resolveIndex = async (root, opts = {}) => {
  return await scanSection(root, { ...opts, root });
};

/**
 * Recursively scans presentation section at `sectionPath`
 * according to the layout scheme.
 *
 * @param {string} sectionPath - The path to the section.
 * @param {boolean} isRoot - Whether the section is the root section.
 */
const scanSection = async (sectionPath, opts) => {
  const section =
    sectionPath === opts.root ? {} : { id: path.basename(sectionPath) };
  const slides = await scanSlidesDir(path.join(sectionPath, 'slides'), opts);
  const sections = await scanSectionsDir(
    path.join(sectionPath, 'sections'),
    opts,
  );

  if (opts.includePath) {
    section.path = path.relative(opts.root, sectionPath);
  }

  if (slides.length) {
    section.slides = slides;
  }

  if (sections.length) {
    section.sections = sections;
  }

  return section;
};

/**
 * Scan a slides directory for slide files.
 *
 * This function looks for files with `.heed` or `.json`
 * extensions, and filters out `.json` files that
 * have a corresponding `.heed` file, as `.heed` takes
 * precedence.
 *
 * @param {string} path - The path to the slides directory.
 */
const scanSlidesDir = async (slidesPath, opts) => {
  if (!existsSync(slidesPath)) return [];
  const files = (await readdir(slidesPath)).filter((file) =>
    /\.(heed|json)$/.test(file),
  );
  const filteredFiles = files.filter((fileName) => {
    if (fileName.toLowerCase().endsWith('.json')) {
      const heedName = fileName.slice(0, -5) + '.heed';
      return !files.includes(heedName);
    }
    return true;
  });
  return filteredFiles
    .sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return 0;
    })
    .map((file) => {
      const f = { id: file.slice(0, -5) };
      if (opts.includePath) {
        f.path = path.relative(opts.root, slidesPath);
        f.fileName = file;
      }
      return f;
    });
};

/**
 * Scan a sections directory for child section directories.
 * This function looks for directories and recursively
 * scans them for slides and sections.
 *
 * @param {string} sectionsPath - The path to the sections directory.
 */
const scanSectionsDir = async (sectionsPath, opts) => {
  const result = [];

  if (existsSync(sectionsPath)) {
    const directories = await readdir(sectionsPath, { withFileTypes: true });

    for (const dir of directories) {
      if (dir.isDirectory) {
        result.push(await scanSection(path.join(sectionsPath, dir.name), opts));
      }
    }
  }

  return result;
};

export default {
  name: layoutName,
  resolveIndex,
};
