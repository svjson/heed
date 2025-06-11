import { raiseError } from './parse-error.js';

/**
 * Tokenize the .heed-file body contents into to "token"-objects that
 * can conveniently be iterated over to produce blocks at the next stage.
 */
export const tokenize = (text, lineOffset) => {
  const lines = text.split(/\r?\n/);
  const tokens = [];
  const sourceRef = { source: text, offset: lineOffset };
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNum = lineOffset+i;
    const arrowMatch = raw.match(/^(>+)(\s+)?(.*)$/);
    if (arrowMatch) {
      depth = arrowMatch[1].length;
      const trimmed = arrowMatch[3];
      if (!trimmed) continue; // skip pure arrow lines
      if (trimmed.startsWith('::')) {
        tokens.push(parseBlockStart(trimmed, depth, lineNum, sourceRef));
      } else if (trimmed.startsWith('@')) {
        tokens.push(parseAttr(trimmed, depth, lineNum));
      } else if (trimmed === '--') {
        tokens.push({ type: 'blockEnd', depth, line: lineNum, data: trimmed });
      } else {
        tokens.push({ type: 'content', value: trimmed, depth, line: lineNum });
      }
    } else if (line.startsWith('::')) {
      tokens.push(parseBlockStart(line, depth, lineNum, sourceRef));
    } else if (line.startsWith('@')) {
      tokens.push(parseAttr(line, depth, lineNum));
    } else if (line === '--') {
      tokens.push({ type: 'blockEnd', depth, line: lineNum, data: line });
    } else if (line === '') {
      tokens.push({ type: 'blank', depth, line: lineNum });
    } else {
      tokens.push({ type: 'content', value: raw, depth, line: lineNum });
    }
  }

  return tokens;
}

/**
 * Parse a block start token.
 */
const parseBlockStart = (line, depth, lineNum, sourceRef) => {
  const match = line.match(/^::\s*([a-zA-Z0-9_-]+)?\s*(\{.*\})?\s*$/);
  if (!match) {
    raiseError(`Invalid block start syntax on line ${lineNum + 1}: ${line}`, lineNum-sourceRef.offset, sourceRef.source);
  }
  return {
    type: 'blockStart',
    blockType: match[1] || null,
    attrText: match[2] || '',
    depth,
    line: lineNum
  };
}

/**
 * Parse an @attribute into an attr-token.
 */
const parseAttr = (line, depth, lineNum) => {
  const match = line.match(/^@([^\s=]+\[[^\]]*\]|[^\s=]+)=(.*)$/);
  if (!match) {
    throw new Error(`Invalid attribute line on line ${lineNum + 1}: ${line}`);
  }

  return {
    type: 'attr',
    key: match[1].trim(),
    value: match[2]?.trim(),
    depth,
    line: lineNum
  };
}
