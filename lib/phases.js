import { parseStyle } from './common.js';

/**
 * Parses the tokens inside a `== phases` block and produces an array of
 * transition steps.
 *
 * @param asideBlock - The aside block with type 'phases' and tokens array
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
      if (!current) throw new Error(`Transition declared outside any !! phase: ${token.raw}`);
      const { target, direction, styles } = token;
      const key = direction === 'enter' ? 'enter' : 'rewind';
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
 * Identify and extract phase macro attributes, returning a tuple containing
 * the new attributes object without the phase attributes and an array
 * of structured phase directives.
 */
export const extractPhaseDirectives = (block) => {
  const phaseDirectives = [];

  const target = block.attributes.id ?? '';

  Object.entries(block.macroAttributes ?? {}).forEach(([attr, value]) => {
    if (attr.startsWith('phase{') || attr.startsWith('phase[')) {
      const phaseMatch = attr.match(/^phase(\{([^}]+)\}|\[([^\]]+)\])\.(.+)$/);
      if (phaseMatch) {
        const [_, _ref, indexRef, idRef, property] = phaseMatch;
        const props = [];

        if (property === 'style') {
          const styles = parseStyle(value);
          Object.entries(styles).forEach((kv) => {
            props.push(kv);
          });
        } else {
          props.push([null, value]);
        }

        props.forEach(([prop, val]) => {
          const [enter, rewind] = val.split('|').map(v => v.trim());
          phaseDirectives.push({
            phase: indexRef ?? idRef,
            type: indexRef ? 'index-ref' : 'id-ref',
            target: target,
            property,
            enter: prop ? `${prop}: ${enter}` : enter,
            rewind: prop ? `${prop}: ${rewind}` : rewind
          });
        });
      }
    }
  });

  return phaseDirectives;
};

/**
 * Ensure that referenced phase exists, and if not create it.
 *
 * If no phases exist on the slide, the `initial` phase is created first.
 *
 * In the case of index references, if the index does not exist, empty phases
 * will be created until it does.
 *
 * In the case of id references, a new phase will be added to the end of the
 * phase array.
 */
const ensurePhase = (slideIr, phaseAttr) => {
  if (!slideIr.phases) slideIr.phases = [{
    type: 'phase',
    id: 'initial',
    transitions: {}
  }];
  if (phaseAttr.type === 'index-ref') {
    const phaseIndex = parseInt(phaseAttr.phase);
    while (slideIr.phases.length <= phaseIndex) {
      slideIr.phases.push({
        type: 'phase',
        id: `phase${slideIr.phases.length}`,
        transitions: {}
      });
    }
    return slideIr.phases.at(-1);
  } else if (phaseAttr.type === 'id-ref') {
    const existingPhase = slideIr.phases.find(p => p.id === phaseAttr.phase);
    if (existingPhase) {
      return existingPhase;
    }
    const newPhase = {
      type: 'phase',
      id: phaseAttr.phase,
      transitions: {}
    };
    slideIr.phases.push(newPhase);
    return newPhase;
  }
  return null;
};

/**
 * Extracts any phase macro directives from the block and applies them to the
 * `phases` key of the slide.
 */
export const applyBlockPhaseAttributes = (blockIr, slideIr) => {
  const phaseAttributes = extractPhaseDirectives(blockIr);

  phaseAttributes.forEach(phaseAttr => {
    const phase = ensurePhase(slideIr, phaseAttr);
    if (!phase.transitions[phaseAttr.target]) {
      phase.transitions[phaseAttr.target] = { enter: {}, rewind: {} };
    }
    const target = phase.transitions[phaseAttr.target];
    if (phaseAttr.property === 'style') {
      Object.assign(target.enter, parseStyle(phaseAttr.enter));
      Object.assign(target.rewind, parseStyle(phaseAttr.rewind));
    } else {
      Object.assign(target.enter, phaseAttr.enter);
      Object.assign(target.rewind, phaseAttr.rewind);
    }
  });
};

/**
 * Recursively walk the block tree and apply phase directive attributes
 * to the blocks, creating phases on the slide IR as needed.
 *
 * @param slideIr - The IR representation of a slide.
 * @param blocks - the list of blocks to walk. Should not be provided by
 * the external caller, but is used internally to recurse.
 */
export const applyPhaseAttributes = (slideIr, blocks) => {
  if (!blocks) blocks = slideIr.contents;
  blocks.forEach(block => {
    applyBlockPhaseAttributes(block, slideIr);
    if (Array.isArray(block.children)) {
      applyPhaseAttributes(slideIr, block.children);
    }
  });

  return slideIr;
};
