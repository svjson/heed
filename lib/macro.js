import { expandLoops } from './loops.js';
import { applyBlockPhaseAttributes } from './phases.js';

/**
 * Expand `%accumulate`-macro if present on `block`.
 *
 * This macro is used to accumulate values across multiple
 * blocks in a slide.
 *
 * Expands the accumulation target of the block using previously
 * accumulated value in context.accumulate[target][accumulationGroup].
 *
 * @param block - The block to expand the macro on.
 * @param _ - Unused parameter, kept for consistency with other macros.
 * @param context - The context object that holds accumulated values.
 */
const expandAccumulateMacro = (block, _, context) => {
  const accumulateDirectives = Object.entries(block.macroAttributes ?? {})
    .filter(([attr, _]) => attr.startsWith('accumulate.'))
    .map(([attr, value]) => ({
      match: attr.match(/^accumulate\.([^\s=]+)/),
      value
    }))
    .filter(d => d.match)
    .map(({ value, match: [_, target] }) => ({
      groupName: value,
      target
    }));

  const accumulateCtx = (context.accumulate ??= {});

  accumulateDirectives.forEach(({ groupName, target }) => {
    const group = (accumulateCtx[groupName] ??= {});
    let accumulated = group[target];

    if (target === 'content' && block.content) {
      if (accumulated === undefined) {
        accumulated = block.content ?? '';
      } else {
        accumulated = `${accumulated}\n${block.content ?? ''}`;
      }
    }

    group[target] = accumulated;
    block.content = accumulated;
  });

  return block;
};

/**
 * List of macro expansion functions that will be applied
 * to blocks by `expandBlockAttributeMacros`.
 */
const ATTRIBUTE_MACROS = [
  applyBlockPhaseAttributes,
  expandAccumulateMacro
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
const expandBlockAttributeMacros = (block, slideIr, context) => {
  return ATTRIBUTE_MACROS.reduce(
    (result, expandFunction) => expandFunction(result, slideIr, context),
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
const expandBlockTreeMacroAttributes = (slideIr, blocks, context) => {
  blocks.forEach(block => {
    expandBlockAttributeMacros(block, slideIr, context);
    if (Array.isArray(block.children)) {
      expandBlockTreeMacroAttributes(slideIr, block.children, context);
    }
  });

  return slideIr;
};

/**
 * Recursively walk the block tree of the intermediate slide representation
 * and expand macro attributes, mutating the blocks or slide as needed.
 *
 * @param slideIr - The IR representation of a slide.
 */
export const expandMacroAttributes = (slideIr) => {
  return expandBlockTreeMacroAttributes(slideIr, slideIr.contents, {});
};

/**
 * Expand any block macros in the block tree.
 *
 * This function is currently a wrapper around `expandLoops`,
 * that expands `%for`-blocks, the only implemented block-level macro.
 *
 * @param blockTree - The tree of blocks to expand.
 */
export const expandBlockMacros = (blockTree) => {
  return expandLoops(blockTree);
};

