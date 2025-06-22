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

    if (context.at(-1)?.type === 'aside') {
      if (line === '--') {
        tokens.push({ type: 'asideEnd', depth, line: lineNum });
        depth--;
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

    if (line.startsWith('::') || line.startsWith('==')) {
      depth++;
      const token = parseBlockStart(line, depth, lineNum, sourceRef);
      tokens.push(token);
      context.push({ type: token.type === 'asideBlockStart' ? 'aside' : 'block', depth, indent: raw.indexOf(line)});
    } else if (line.startsWith('@')) {
      tokens.push(parseAttr(line, depth, lineNum));
    } else if (line.match(/^%[^\s=]+=.*$/)) {
      tokens.push(parseMacroAttr(line, depth, lineNum, sourceRef));
    } else if (line === '--') {
      tokens.push({ type: 'blockEnd', depth, line: lineNum, data: line });
      depth--;
      context.pop();
    } else if (context.length && line === '') {
      tokens.push({ type: 'blank', depth, line: lineNum });
    } else if (context.length && line !== '') {
      const contentStart = Math.max(0, raw.indexOf(line));
      const content = raw.slice(Math.min(contentStart, context.at(-1)?.indent ?? 0));
      tokens.push({ type: 'content', value: content, depth, line: lineNum });
    }
  }

  return tokens;
};

/**
 * Parse a block start token.
 */
const parseBlockStart = (line, depth, lineNum, sourceRef) => {
  const match = line.match(/^(::|==)\s*(%)?([a-z:A-Z0-9_-]+)?\s*(\{.*\})?\s*$/);
  if (!match) {
    raiseError(`Invalid block start syntax on line ${lineNum + 1}: ${line}`, lineNum-sourceRef.offset, sourceRef.source);
  }

  const type = match[1] === '=='
    ? 'asideBlockStart'
    : match[2] ? 'macroBlockStart' : 'blockStart';
  const blockType = match[3] || '';

  return {
    type,
    blockType,
    attrText: match[4] || '',
    depth,
    line: lineNum
  };
};

/**
 * Parse an @attribute into an attr-token.
 */
const parseAttr = (line, depth, lineNum, sourceRef) => {
  const match = line.match(/^@([^\s=]+\[[^\]]*\]|[^\s=]+)=(.*)$/);
  if (!match) {
    raiseError(`Invalid attribute line on line ${lineNum + 1}: ${line}`, lineNum-sourceRef, sourceRef.source);
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
const parseMacroAttr = (line, depth, lineNum, sourceRef) => {
  const match = line.match(/^%([^\s=]+\[[^\]]*\]|[^\s=]+)=(.*)$/);
  if (!match) {
    raiseError(`Invalid macro attribute line on line ${lineNum + 1}: ${line}`, lineNum-sourceRef.offset, sourceRef.source);
  }

  return {
    type: 'macroAttr',
    key: match[1].trim(),
    value: match[2]?.trim(),
    depth,
    line: lineNum
  };
};
