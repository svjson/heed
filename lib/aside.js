import { parseStyle } from './common.js';

const parseBlockComponents = (
  asideBlock,
  { content = [], attributes = {}, macroAttributes = {} },
) => {
  for (const token of asideBlock.tokens) {
    if (token.type === 'content' || token.type === 'blank') {
      content.push(token.value);
    } else if (token.type === 'attr') {
      attributes[token.key] = token.value;
    } else if (token.type === 'macroAttr') {
      macroAttributes[token.key] = token.value;
    }
  }

  return { content, attributes, macroAttributes };
};

/**
 * Parses the tokens inside a `== content` block and produces a realized
 * data-block.
 *
 * This different from a regular slide content block, in that they are virtual
 * content-only blocks that are separate from the renderable blocks, and used
 * only when renderable blocks explicitly link to them.
 *
 * @param asideBlock - The unparsed aside block with type 'content'.
 * @return An realized virtual content block
 */
const parseContentBlock = (asideBlock) => {
  const { content, attributes, macroAttributes } = parseBlockComponents(
    asideBlock,
    {
      content: [],
      attributes: asideBlock.attributes ?? {},
      macroAttributes: asideBlock.macroAttributes ?? {},
    },
  );

  return {
    attributes,
    macroAttributes,
    content: content.join('\n'),
  };
};

/**
 * Parse custom aside block provided by a plugin.
 *
 * Performs minimal parsing of attributes and content, leaving the
 * responsibility of closer inspection and parsing to the plugin itself
 * in the slide viewer.
 */
const parseCustomBlock = (asideType, asideBlock) => {
  if (!asideType.identifier) {
    throw new Error(
      'Invalid aside definition. No "identifier" specified:',
      asideType,
    );
  }

  const { content, attributes } = parseBlockComponents(asideBlock, {
    attributes: asideBlock.attributes ?? {},
  });

  const id = attributes.id;

  delete attributes.id;

  return {
    id: id,
    attributes,
    content,
  };
};

/**
 * Parses the content from a `== notes` block and produces a notes object
 */
const parseNotesBlock = (asideBlock) => {
  const { content, attributes } = parseBlockComponents(asideBlock, {
    content: [],
    attributes: asideBlock.attributes ?? {},
    macroAttributes: asideBlock.macroAttributes ?? {},
  });

  return {
    type: 'text',
    source: attributes.name ?? attributes.id ?? 'Slide',
    content: content.join('\n'),
  };
};

/**
 * Parses the tokens inside a `== phases` block and produces an array of
 * transition steps.
 *
 * @param asideBlock - The aside block with type 'phases'.
 * @returns An array of phase entries with id and transitions
 */
export const parsePhasesBlock = (asideBlock) => {
  const phases = [];
  let current = null;

  for (const token of asideBlock.tokens) {
    if (token.type === 'phaseStart') {
      if (current) phases.push(current);
      current = { type: 'phase', id: token.id, transitions: {} };
    } else if (token.type === 'transition') {
      if (!current)
        throw new Error(
          `Transition declared outside any !! phase: ${token.raw}`,
        );
      const { target, direction, styles } = token;
      if (!current.transitions[target]) {
        current.transitions[target] = {};
      }
      if (!current.transitions[target][direction]) {
        current.transitions[target][direction] = {};
      }
      Object.assign(current.transitions[target][direction], parseStyle(styles));
    }
  }

  if (current) phases.push(current);
  return phases;
};

/**
 * Parses the aside blocks from a slide IR and populates a
 * meta object with the parsed aside data that does not belong
 * directly in/on the slide IR itself.
 *
 * @param asideBlocks - The array of aside blocks to parse.
 * @param slideIr - The slide IR object to populate with aside data.
 *
 * @return The meta object containing parsed aside data.
 */
export const parseAsideBlocks = (asideBlocks, slideIr, plugins) => {
  const meta = {};

  const pluginTypes = Object.keys(plugins ?? {}).reduce((types, pluginId) => {
    const providedAsides = plugins?.[pluginId]?.definition?.asides;
    Object.entries(providedAsides ?? {}).forEach(([typeName, typeDef]) => {
      types[`${pluginId}:${typeName}`] = typeDef;
    });
    return types;
  }, {});

  asideBlocks.forEach((aside) => {
    switch (aside.type) {
    case 'phases':
      slideIr.phases = parsePhasesBlock(aside);
      break;
    case 'content':
      const content = (meta.content ??= []);
      content.push(parseContentBlock(aside));
      break;
    case 'notes':
      const notes = (slideIr.notes ??= []);
      notes.push(parseNotesBlock(aside));
      break;
    default:
      if (pluginTypes[aside.type]) {
        const customBlock = parseCustomBlock(pluginTypes[aside.type], aside);
        (slideIr.custom[aside.type] ??= {})[customBlock.id] = customBlock;
        return;
      }

      console.error(aside);
      throw new Error(`Invalid aside type: '${aside.type}'`);
    }
  });

  return meta;
};
