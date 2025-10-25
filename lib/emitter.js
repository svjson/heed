/**
 * Emit a slide and its contents to a formatting target.
 *
 * This a translation layer for the .heed-file parser allowing
 * multiple output formats. Currently there is only, but I'm pretty
 * sure that in the end I am going to get rid of that nasty old JSON
 * slide format, so this ensures there's any easy way to do that.
 * All on that day.
 */
export const emitSlide = (ir, target) => {
  if (ir.frontmatter) {
    target.setMeta(ir.frontmatter);
  }

  for (const block of ir.contents) {
    emitBlock(block, target);
  }

  if (Array.isArray(ir.phases)) {
    target.openPhases?.();
    for (const phase of ir.phases) {
      target.addPhase?.(phase.id, phase.transitions);
    }
    target.closePhases?.();
  }

  if (ir.custom) {
    target.addCustomComponents?.(ir.custom);
  }

  target.done();
};

/**
 * Emit a single block to the formatting target.
 *
 * Does this in multiple steps in order to be able to produce
 * block hierarchies. `openBlock` opens a new block, `emitBlock`
 * recursively emits children, `writeContent` emits the block
 * contents and `closeBlock` finally closes/ends the block.
 */
const emitBlock = (block, target) => {
  const type = block.type;
  const attrs = { ...block.attributes };
  const content = block.content || '';

  target.openBlock(type, attrs);

  if (block.children && block.children.length > 0) {
    for (const child of block.children) {
      emitBlock(child, target);
    }
  } else if (content) {
    target.writeContent(content);
  }

  target.closeBlock();
};
