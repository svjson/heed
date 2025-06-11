import { tokenize } from './tokenize.js';
import { parseBlocks } from './blocks.js';
import { expandLoops } from './loops.js';

/**
 * Parses a .heed-file into a basic intermediary representation form.
 *
 * This is done in four steps:
 * 1. Parse the Frontmatter-style file header
 * 2. Tokenize the body of the file.
 * 3. Parse tokens into blocks.
 * 4. Unroll any loop-blocks.
 *
 * @param text - The raw .heed-file contents as an utf-8 string
 *
 * @return An object containing the frontmatter header and the presentation
 * contents in intermediary format.
 */
export const parseHeedFile = (text) => {
  const { frontmatter, body, endLine } = parseFrontmatter(text);
  const tokens = tokenize(body, endLine);
  const blockTree = parseBlocks(tokens, text);
  const expanded = expandLoops(blockTree);

  return {
    frontmatter,
    contents: expanded
  };
}

/**
 * Parse the frontmatter file header into a regular Object/dict.
 */
const parseFrontmatter = (text) => {
  const lines = text.split(/\r?\n/);
  if (!/^\-+$/.test(lines[0].trim())) {
    return { frontmatter: {}, body: text, endLine: 0 };
  }

  let fmEnd = lines.findIndex((l, i) => i > 0 && /^\-+$/.test(l.trim()));
  if (fmEnd === -1) {
    throw new Error('Unterminated frontmatter block');
  }

  const fmLines = lines.slice(1, fmEnd);
  const frontmatter = {};
  for (const line of fmLines) {
    const match = line.match(/^\s*([^:]+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      frontmatter[key.trim()] = value.trim();
    }
  }

  const body = lines.slice(fmEnd + 1).join('\n');
  return { frontmatter, body, endLine: fmLines.length+2 };
}
