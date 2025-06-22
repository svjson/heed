import { raiseError } from './parse-error.js';

const BLOCK_TYPES = {
  'column-layout': {
    implicitChildBlock: 'column'
  }
};

const resolveImplicitBlockType = ({ block }, token, source) => {
  if (!block) {
    return 'text';
  }

  const { implicitChildBlock } = BLOCK_TYPES[block.type] ?? {};
  if (!implicitChildBlock) {
    raiseError(`Implicit child block type not allowed on blocks of type '${block.type}' on line ${token.line+1}`, token.line, source);
  }

  return implicitChildBlock;
};

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
    if (token.type === 'blockStart' || token.type === 'macroBlockStart') {
      const [attrs, macroAttrs] = parseInlineAttrs(token.attrText);

      const block = {
        type: token.blockType || resolveImplicitBlockType(stack.at(-1) ?? {}, token, source),
        attributes: attrs,
        content: '',
        children: [],
        depth: token.depth
      };
      if (token.type === 'macroBlockStart') {
        block.blockType = 'macro';
      }
      if (Object.keys(macroAttrs).length) {
        block.macroAttributes = macroAttrs;
      }
      stack.push({ block, children: block.children, depth: token.depth });
      current = block;
    }

    else if (token.type === 'attr') {
      if (!current) raiseError(`Attribute with no open block on line ${token.line + 1}`, token.line, source);
      current.attributes[token.key] = appendOrSet(current.attributes[token.key], token.value);
    }

    else if (token.type === 'macroAttr') {
      if (!current) raiseError(`Macro Attribute with no open block on line ${token.line + 1}`, token.line, source);
      current.macroAttributes = current.macroAttributes || {};
      current.macroAttributes[token.key] = appendOrSet(current.macroAttributes[token.key], token.value);
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
      if (depth > parent?.depth || parent?.root) {
        parent.children.push(block);
      } else {
        raiseError(`Unexpected dedent or block end at line ${token.line + 1}`, token.line, source);
      }
      current = stack.length > 1 ? stack[stack.length - 1].block : null;
    }
  }

  if (stack.length > 1) {
    raiseError(`Unexpected end of content. ${stack.length-1} blocks opened, but not closed.`, tokens.at(-1)?.line, source);
  }

  return root;
};

/**
 * Parse inline attributes on the block definition line.
 *
 * @param text - The inline attribute block part of the block definition line.
 */
export const parseInlineAttrs = (text) => {
  const attrs = {};
  const macroAttrs = {};
  if (!text) return [attrs, macroAttrs];
  const match = text.match(/\{(.*)\}/);
  if (!match) return [attrs, macroAttrs];
  const parts = match[1].split(/\s+/);
  for (const part of parts) {
    const [key, ...rest] = part.split('=');
    if (key) {
      if (key.startsWith('%')) {
        macroAttrs[key.slice(1)] = rest.join('=') || true;
      } else {
        attrs[key] = rest.join('=') || true;
      }
    }
  }
  return [attrs, macroAttrs];
};

/**
 * Append a value to an existing attribute or set it if undefined.
 */
const appendOrSet = (existing, value) => {
  if (existing === undefined) return value;
  if (Array.isArray(existing)) return [...existing, value];
  return [existing, value];
};
