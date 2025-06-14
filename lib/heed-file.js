import { tokenize } from './tokenize.js';
import { parseBlocks } from './blocks.js';
import { expandLoops } from './loops.js';
import { parsePhasesBlock, applyPhaseAttributes } from './phases.js';

/**
 * Parses a .heed-file into a basic intermediary representation form.
 *
 * This is done in four steps:
 * 1. Parse the Frontmatter-style file header
 * 2. Tokenize the body of the file.
 * 3. Separate content block tokens from asides.
 * 4. Parse tokens into blocks.
 * 5. Unroll any loop-blocks.
 *
 * @param text - The raw .heed-file contents as an utf-8 string
 *
 * @return An object containing the frontmatter header and the presentation
 * contents in intermediary format.
 */
export const parseHeedFile = (text) => {
  const { frontmatter, body, endLine } = parseFrontmatter(text);
  const tokens = tokenize(body, endLine);
  const { contentTokens, asideBlocks } = separateAsideBlocks(tokens);
  const blockTree = parseBlocks(tokens, text);
  const expanded = expandLoops(blockTree);

  const result = {
    frontmatter,
    contents: expanded
  };

  asideBlocks.forEach(aside => {
    switch (aside.type) {
    case 'phases':
      result.phases = parsePhasesBlock(aside);
      break;
    default:
      throw new Error(`Invalid aside type: '${aside.type}`)
    }
  });

  return applyPhaseAttributes(result);
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

/**
 * Scan the parsed tokens and collect all asides (non-content blocks) into
 * a separate structure.
 */
const separateAsideBlocks = (tokens) => {
  const contentTokens = [];
  const asideBlocks = [];
  let inAside = false;
  let currentAside = null;

  for (const token of tokens) {
    if (token.type === 'asideStart') {
      inAside = true;
      currentAside = { type: token.name, tokens: [] };
    } else if (inAside && token.type === 'asideEnd') {
      asideBlocks.push(currentAside);
      inAside = false;
      currentAside = null;
    } else if (inAside) {
      currentAside.tokens.push(token);
    } else {
      contentTokens.push(token);
    }
  }

  if (currentAside) {
    console.warn(`Unterminated aside block: '${currentAside.type}'`)
    asideBlocks.push(currentAside);
  }

  return { contentTokens, asideBlocks };
}
