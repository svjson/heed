import { parseStyle } from '../common.js';
import { ensurePhase } from './phase-macro.js';

/**
 * Expand a block reference value into a list of block IDs.
 * This function interprets the value as a range, a list of IDs,
 * or the special keyword like 'all'.
 *
 * The reference value is then used to walk through the blocks
 * of `slideIr` to capture the ids referred to.
 *
 * Valid reference formats are:
 * all - All blocks are captured
 * ablockid, someblockid, otherblockid - a comma separated list of ids
 * someblockid..otherblockid - 'someblockid', 'otherblockid' and all blocks between them.
 * ...someblockid - All blocks up to and including 'someblockid'
 * someblockid... - All blocks following, and including, 'someblockid'
 *
 * @param slideIr - The slide intermediate representation containing blocks.
 * @param value - The block reference value to expand.
 *
 * @return An array of block IDs that match the reference.
 */
export const expandBlockReference = (slideIr, value) => {
  let filter = (_ctx, _id) => false;
  const ctx = { capture: false };
  const rangeMatch = value.trim().match(/^(.+?)\.\.(.+)$/);
  const untilMatch = value.trim().match(/^\.\.\.(.+)$/);
  const fromMatch = value.trim().match(/^(.+?)\.\.\.$/);
  if (value.trim() === 'all') {
    filter = (_ctx, _id) => true;
  } else if (untilMatch) {
    ctx.capture = true;
    filter = (ctx, id) => {
      if (id === untilMatch[1]) {
        ctx.capture = false;
        return true;
      }
      return ctx.capture;
    };
  } else if (fromMatch) {
    ctx.capture = false;
    filter = (ctx, id) => {
      if (id === fromMatch[1]) {
        ctx.capture = true;
        return true;
      }
      return ctx.capture;
    };
  } else if (rangeMatch) {
    filter = (ctx, id) => {
      if (id === rangeMatch[1]) {
        ctx.capture = true;
        return true;
      }
      if (ctx.capture && id === rangeMatch[2]) {
        ctx.capture = false;
        return true;
      }
      return ctx.capture;
    };
  } else {
    const values = value.split(',').map(v => v.trim());
    filter = (_ctx, id) => values.includes(id);
  }

  return slideIr.contents
    .map(block => block?.attributes?.id)
    .filter(blockId => filter(ctx, blockId));
};

/**
 * Extracts groups of %reveal-macros from the slide IR frontmatter, collecting
 * the properties belonging to each group together, and expands them.
 *
 * @param slideIr - The slide intermediate representation containing frontmatter.
 *
 * @return An object containing keys of processed attributes and a groups object.
 */
export const extractGroups = (slideIr) => {
  return Object.entries(slideIr.frontmatter)
    .reduce((result, [attr, value]) => {
      const { keys, groups } = result;
      if (attr.startsWith('%reveal')) {
        const match = attr.match(/^%reveal(\[([^\]]*)\])?(\.(.*))?$/);

        const groupName = match[2] ?? '__default';
        const prop = match[4] ?? '__targetBlocks';

        if (prop === '__targetBlocks') {
          (groups[groupName] ??= {})[prop] = expandBlockReference(slideIr, value);
        } else if (prop === 'style') {
          const styles = parseStyle(value);
          (groups[groupName] ??= {})[prop] = Object.entries(styles)
            .reduce((result, [styleProp, styleVal]) => {
              const [enter, rewind] = styleVal.split('|').map(v => v.trim());
              if (enter) result.enter[styleProp] = enter;
              if (rewind) result.rewind[styleProp] = rewind;
              return result;
            }, { enter: {}, rewind: {} });
        } else {
          (groups[groupName] ??= {})[prop] = value;
        }
        keys.push(attr);
      }
      return result;
    }, { keys: [], groups: {}});
};

/**
 * Expand the %reveal macro attributes in the frontmatter section of the slide IR.
 *
 * This removes the attributes from the frontmatter and applies the appropriate
 * steps to the phases-section of the slide IR, creating it if necessary.
 *
 * The macro attributes are expected to be in the form of:
 * %reveal[group][.property] = value
 * Where `group` is an optional group, which can be used to generate parallel
 * transition sequences.
 *
 * @param slideIr - The slide intermediate representation
 *
 * @returns The modified slide IR with expanded %reveal macros.
 */
export const expandRevealMacro = (slideIr) => {
  const extractedGroups = extractGroups(slideIr);

  Object.entries(extractedGroups.groups).forEach(([_, group]) => {
    const transition = group.style ?? { enter: { display: 'block' }, rewind: { display: 'none' } };

    group.__targetBlocks.forEach((blockId, index) => {
      const phase = ensurePhase(slideIr, { type: 'index-ref', phase: `${index+1}`});

      const phaseTransition = (phase.transitions[blockId] ??= { enter: {}, rewind: {} });
      Object.assign(phaseTransition.enter, transition.enter);
      Object.assign(phaseTransition.rewind, transition.rewind);
    });
  });

  for (const key of extractedGroups.keys) {
    delete slideIr.frontmatter[key];
  }

  return slideIr;
};
