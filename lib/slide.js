import { constants, existsSync, mkdirSync } from 'fs';
import { access, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { emitSlide } from './emitter.js';
import { parseHeedFile } from './heed-file.js';
import { createJSONTarget } from './json-target.js';
import { makeErrorSlide } from './parse-error.js';

/**
 * Supported input formats, in search order.
 */
const FORMATS = ['heed', 'json'];

/**
 * Work-around for the non-argument that "fileExists is a bad idea because there
 * is no guarantee that the file STILL exists after checking". Well, that goes for
 * any query about resources anywhere that we don't have absolute control over.
 * So maybe we should just stop supporting networking because there are no guarantees.
 * Hogwash.
 */
const fileExists = async path => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Attempt to load a slide definition from the presentationRoot using a relative path.
 * Will attempt to load the slide in the format order specified by {@link FORMATS}.
 *
 * If the slide is loaded in heed format, it will be parsed and transformed to JSON.
 *
 * @param presentationRoot - The root folder of the presentation
 * @param path - The relative path including slide id as filename without extension.
 * @param opts - Optional parameters:
 *                 - `includeNotes`: If true, will resolve and include any speaker
 *                    notes defined for the loaded slide.
 *                 - `useErrorSlide`: If true, will return an error slide JSON
 *                    instead of throwing an error when the slide cannot be parsed.
 *
 * @return The slide in JSON format.
 */
export const loadSlide = async (presentationRoot, slidePath, opts = {}) => {
  const [fileName, format] = await findSlideFile(presentationRoot, slidePath);
  if (!fileName) {
    return null;
  }

  const data = await readFile(fileName, 'utf-8');
  if (format === 'json') {
    return data;
  }
  try {
    const ir = parseHeedFile(data);
    if (opts.includeNotes) {
      await resolveSpeakerNotes(
        ir,
        path.dirname(path.join(presentationRoot, slidePath))
      );
    }
    const target = createJSONTarget();
    emitSlide(ir, target);
    return target.getJSON();
  } catch (e) {
    if (opts.useErrorSlide) {
      return makeErrorSlide(e, fileName.substring(presentationRoot.length));
    }
    throw new Error(`Error parsing '${path}': ${e}`, e);
  }
};

/**
 * Resolve speaker notes for a slide.
 *
 * This function checks the frontmatter for a `notes` field, which should
 * contain a path to a notes file.
 *
 * @param ir - The intermediary representation of the slide
 * @param slideDir - The directory where the slide file is located
 * @return {Promise<void>} A promise that resolves when the notes have been
 *                         added to the slide's frontmatter.
 */
const resolveSpeakerNotes = async (ir, slideDir) => {
  const notes = [];
  const fmNotes = ir.frontmatter.notes;
  if (typeof fmNotes === 'string' && fmNotes !== '') {
    const notesPath = path.join(slideDir, fmNotes);
    if (existsSync(notesPath)) {
      const noteFileContents = await readFile(notesPath, 'utf-8');
      notes.push({
        type: 'text',
        source: fmNotes,
        content: noteFileContents
      });
    } else {
      notes.push({
        type: 'error',
        source: fmNotes,
        content: `Referenced notes file '${fmNotes}' does not exist.`
      });
    }
  }
  for (const irNotes of ir.notes ?? []) {
    notes.push(irNotes);
  }

  ir.frontmatter.notes = notes;
};

/**
 * Determine which slide file to load based on the lookup-order described by
 * {@link FORMATS}.
 */
export const findSlideFile = async (presentationRoot, slidePath) => {
  for (const format of FORMATS) {
    const fileName = path.join(presentationRoot, `${slidePath}.${format}`);
    const existsp = await fileExists(fileName);
    if (existsp) {
      return [fileName, format];
    }
  }

  return [null, null];
};

/**
 * Create a slide file
 *
 * @param filePath - The path to the slide file to create
 * @param frontMatter - An object containing the frontmatter data to write
 */
export const createSlide = async (filePath, frontMatter) => {
  const lines = [];
  Object.entries(frontMatter).forEach(entry => {
    lines.push(entry.join(': '));
  });
  const divider = '-'.repeat(Math.max(lines.reduce((max, line) => Math.max(max, line.length), 0)));

  const dirName = path.dirname(filePath);
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true });
  }

  await writeFile(filePath, [divider, ...lines, divider, ''].join('\n'), 'utf-8');
};
