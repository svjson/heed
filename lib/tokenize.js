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
  let context = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNum = lineOffset + i;

    if (context.at(-1) === 'aside') {
      if (line === '--') {
        tokens.push({ type: 'asideEnd', line: lineNum });
        context.pop();
        continue;
      }

      if (/^!!\s+([a-zA-Z0-9_-]+)\s*$/.test(line)) {
        const id = line.match(/^!!\s+([a-zA-Z0-9_-]+)\s*$/)[1];
        tokens.push({ type: 'phaseStart', id, line: lineNum });
        continue;
      }

      if (/^#([^\s]+)\s+-->|<--\s+/.test(line)) {
        const match = line.match(/^#([^\s]+)\s+(-->|<--)\s+(.*)$/);
        if (match) {
          tokens.push({
            type: 'transition',
            direction: match[2] === '-->' ? 'enter' : 'rewind',
            target: match[1],
            styles: match[3].trim(),
            line: lineNum
          });
          continue;
        }
      }
    }

    const arrowMatch = raw.match(/^(>+)(\s+)?(.*)$/);
    if (arrowMatch) {
      depth = arrowMatch[1].length;
      const trimmed = arrowMatch[3];
      if (!trimmed) continue; // skip pure arrow lines
      if (trimmed.startsWith('::')) {
        tokens.push(parseBlockStart(trimmed, depth, lineNum, sourceRef));
        context.push('block');
      } else if (trimmed.startsWith('@')) {
        tokens.push(parseAttr(trimmed, depth, lineNum));
      } else if (trimmed.startsWith('%')) {
        tokens.push(parseMacroAttr(trimmed, depth, lineNum));
      } else if (trimmed === '--') {
        tokens.push({ type: 'blockEnd', depth, line: lineNum, data: trimmed });
        context.pop();
      } else {
        tokens.push({ type: 'content', value: trimmed, depth, line: lineNum });
      }
    } else if (/^==\s+([a-zA-Z0-9_-]+)\s*$/.test(line)) {
      const name = line.match(/^==\s+([a-zA-Z0-9_-]+)\s*$/)[1];
      tokens.push({ type: 'asideStart', name, line: lineNum });
      context.push('aside');
      continue;
    } else if (line.startsWith('::')) {
      tokens.push(parseBlockStart(line, depth, lineNum, sourceRef));
      context.push('block');
    } else if (line.startsWith('@')) {
      tokens.push(parseAttr(line, depth, lineNum));
    } else if (line.startsWith('%')) {
      tokens.push(parseMacroAttr(line, depth, lineNum));
    } else if (line === '--') {
      tokens.push({ type: 'blockEnd', depth, line: lineNum, data: line });
      context.pop();
    } else if (context.length && line === '') {
      tokens.push({ type: 'blank', depth, line: lineNum });
    } else if (context.length && line !== '') {
      tokens.push({ type: 'content', value: raw, depth, line: lineNum });
    }
  }

  return tokens;
};

/**
 * Parse a block start token.
 */
const parseBlockStart = (line, depth, lineNum, sourceRef) => {
  const match = line.match(/^::\s*(%)?([a-z:A-Z0-9_-]+)?\s*(\{.*\})?\s*$/);
  if (!match) {
    raiseError(`Invalid block start syntax on line ${lineNum + 1}: ${line}`, lineNum-sourceRef.offset, sourceRef.source);
  }
  return {
    type: match[1] ? 'macroBlockStart' : 'blockStart',
    blockType: match[2] || null,
    attrText: match[3] || '',
    depth,
    line: lineNum
  };
};

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
};

/**
 * Parse a %macro-attribute into a macroAttr-token.
 */
const parseMacroAttr = (line, depth, lineNum) => {
  const match = line.match(/^%([^\s=]+\[[^\]]*\]|[^\s=]+)=(.*)$/);
  if (!match) {
    throw new Error(`Invalid macro attribute line on line ${lineNum + 1}: ${line}`);
  }

  return {
    type: 'macroAttr',
    key: match[1].trim(),
    value: match[2]?.trim(),
    depth,
    line: lineNum
  };
};
