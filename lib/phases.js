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
