import { raiseError } from './parse-error.js'

/**
 * Parse .heed-file tokens into intermediary representation blocks.
 *
 * @param tokens - The tokenized file contents.
 * @param source - The raw source file, used to produce meaningful error messages.
 */
export const parseBlocks = (tokens, source) => {
  const root = [];
  const stack = [{ root: true, children: root, depth: 0 }];

  let current = null;

  for (const token of tokens) {
    if (token.type === 'blockStart') {
      const block = {
        type: token.blockType || 'anonymous',
        attributes: parseInlineAttrs(token.attrText),
        content: '',
        children: [],
        depth: token.depth
      };
      stack.push({ block, children: block.children, depth: token.depth });
      current = block;
    }

    else if (token.type === 'attr') {
      if (!current) raiseError(`Attribute with no open block on line ${token.line + 1}`, token.line, source);
      current.attributes[token.key] = appendOrSet(current.attributes[token.key], token.value);
    }

    else if (token.type === 'content') {
      if (!current) raiseError(`Content with no open block on line ${token.line + 1}`, token.line, source);
      current.content += (current.content ? '\n' : '') + token.value;
    }

    else if (token.type === 'blank' && current && current.content.length) {
      current.content += '\n';
    }

    else if (token.type === 'blockEnd') {
      const { block, depth } = stack.pop();
      const parent = stack[stack.length - 1];
      if (depth > parent.depth || parent.root) {
        parent.children.push(block);
      } else {
        raiseError(`Unexpected dedent or block end at line ${token.line + 1}`, token.line, source);
      }
      current = stack.length > 1 ? stack[stack.length - 1].block : null;
    }
  }

  return root;
}

/**
 * Parse inline attributes on the block definition line.
 *
 * @param text - The inline attribute block part of the block definition line.
 */
const parseInlineAttrs = (text) => {
  const result = {};
  if (!text) return result;
  const match = text.match(/\{(.*)\}/);
  if (!match) return result;
  const parts = match[1].split(/\s+/);
  for (const part of parts) {
    const [key, ...rest] = part.split('=');
    if (key) {
      result[key] = rest.join('=') || true;
    }
  }
  return result;
}

/**
 * Append a value to an existing attribute or set it if undefined.
 */
const appendOrSet = (existing, value) => {
  if (existing === undefined) return value;
  if (Array.isArray(existing)) return [...existing, value];
  return [existing, value];
}
