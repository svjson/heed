import { expandAccumulateMacro } from './accumulate-macro.js';
import { expandContentMacro } from './content-macro.js';
import { expandForBlock } from './for-block-macro.js';
import { expandPhaseMacro } from './phase-macro.js';
import { expandRevealMacro } from './reveal-fm-macro.js';

/**
 * List of frontmatter-level macro expansion function that will
 * be applied to blocks by `expandFrontmatterMacros`
 */
const FRONTMATTER_MACROS = [
  expandRevealMacro
];

/**
 * List of block macro expansion functions that will be applied
 * to blocks by `expandBlockMacros`.
 */
const BLOCK_MACROS = {
  'for': expandForBlock
};

/**
 * List of macro expansion functions that will be applied
 * to blocks by `expandBlockAttributeMacros`.
 */
const ATTRIBUTE_MACROS = [
  expandPhaseMacro,
  expandAccumulateMacro,
  expandContentMacro
];

/**
 * Allow macro implementations to each take a pass at the block
 *
 * This function applies all registered attribute macros to the
 * given block, mutating it as needed.
 *
 * @param block - The block to expand macros on.
 * @param slideIr - The intermediate representation of the slide.
 * @param context - The context object that holds accumulated values.
 */
const expandBlockAttributeMacros = (block, slideIr, context, meta) => {
  return ATTRIBUTE_MACROS.reduce(
    (result, expandFunction) => expandFunction(result, slideIr, context, meta),
    block
  );
};

/**
 * Recursively walk a list of  block tree nodes and expand macro attributes,
 * mutating the blocks or slideIr as needed.
 *
 * @param slideIr - The IR representation of a slide.
 * @param blocks - The list of blocks to walk.
 * @param context - Accumulative expansion context, used by macros that depend
 *                  on state emitted by expansion of previous blocks.
 */
const expandBlockTreeMacroAttributes = (slideIr, blocks, context, meta) => {
  blocks.forEach(block => {
    expandBlockAttributeMacros(block, slideIr, context, meta);
    if (Array.isArray(block.children)) {
      expandBlockTreeMacroAttributes(slideIr, block.children, context, meta);
    }
  });

  return slideIr;
};

/**
 * This function applies all registered frontmatter macros to the
 * given slide IR, mutating it as needed.
 *
 * @param slideIr - The IR representation of a slide.
 */
export const expandFrontmatterMacros = (slideIr) => {
  return FRONTMATTER_MACROS.reduce(
    (result, expandFunction) => expandFunction(result),
    slideIr
  );
};

/**
 * Recursively walk the block tree of the intermediate slide representation
 * and expand macro attributes, mutating the blocks or slide as needed.
 *
 * @param slideIr - The IR representation of a slide.
 */
export const expandMacroAttributes = (slideIr, meta = {}) => {
  const context = {};
  expandBlockTreeMacroAttributes(slideIr, meta.content ?? [], context, meta);
  return expandBlockTreeMacroAttributes(slideIr, slideIr.contents, context, meta);
};

/**
 * Expand any block macros in the block tree.
 *
 * Walks and rebuilds the block tree, node by node, expanding any block macros
 * encountered.
 *
 * @param blockTree - The tree of blocks to expand.
 * @return - A new block tree with macros expanded.
 */
export const expandBlockMacros = (blockTree) => {
  const expandedTree = [];

  for (const block of blockTree) {
    if (block.blockType === 'macro') {
      const macro = BLOCK_MACROS[block.type];
      if (!macro) {
        throw new Error(`Unrecognized block macro name: '${block.type}'`);
      }
      expandedTree.push(...macro(block));
    } else {
      const clone = { ...block };
      if (clone.children) {
        clone.children = expandBlockMacros(clone.children);
      }
      expandedTree.push(clone);
    }
  }

  return expandedTree;
};

