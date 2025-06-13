import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

import { parseHeedFile } from './heed-file.js';
import { createJSONTarget } from './json-target.js';
import { emitSlide } from './emitter.js';

/**
 * Supported input formats, in search order.
 */
const FORMATS = ['heed', 'json']

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
    return false
  }
}

/**
 * Attempt to load a slide definition from the presentationRoot using a relative path.
 * Will attempt to load the slide in the format order specified by {@link FORMATS}.
 *
 * If the slide is loaded in heed format, it will be parsed and transformed to JSON.
 *
 * @param presentationRoot - The root folder of the presentation
 * @param path - The relative path including slide id as filename without extension.
 *
 * @return The slide in JSON format.
 */
export const loadSlide = async (presentationRoot, path) => {
  const [fileName, format] = await findSlideFile(presentationRoot, path);
  if (!fileName) {
    return null;
  }

  const data = await readFile(fileName, 'utf-8');
  if (format === 'json') {
    return data;
  }

  const ir = parseHeedFile(data);
  const target = createJSONTarget();
  const json = emitSlide(ir, target);
  return target.getJSON();
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
