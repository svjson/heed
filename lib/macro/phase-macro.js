import { parseStyle } from '../common.js';

/**
 * Identify and extract phase macro attributes, returning a tuple containing
 * the new attributes object without the phase attributes and an array
 * of structured phase directives.
 */
export const extractPhaseDirectives = (block) => {
  const target = block.attributes?.id ?? '';

  return Object.entries(block.macroAttributes ?? {})
    .filter(([attr, _]) => attr.startsWith('phase{') || attr.startsWith('phase['))
    .map(([attr, value]) => ({
      match: attr.match(/^phase(\{([^}]+)\}|\[([^\]]+)\])\.(.+)$/),
      value
    }))
    .filter(d => d.match)
    .map(({ value, match: [_, _ref, indexRef, idRef, property] }) => {
      const props = [];

      if (property === 'style') {
        const styles = parseStyle(value);
        Object.entries(styles).forEach((kv) => {
          props.push(kv);
        });
      } else {
        props.push([null, value]);
      }

      return props.map(([prop, val]) => {
        const [enter, rewind] = val.split('|').map(v => v.trim());
        return {
          phase: indexRef ?? idRef,
          type: indexRef ? 'index-ref' : 'id-ref',
          target,
          property,
          enter: prop ? `${prop}: ${enter}` : enter,
          rewind: prop ? `${prop}: ${rewind}` : rewind
        };
      });
    })
    .reduce((result, props) => [...result, ...props], []);

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
export const expandPhaseMacro = (blockIr, slideIr, _ctx, _meta) => {
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

  return blockIr;
};
