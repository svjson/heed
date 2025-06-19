import { parseStyle } from './common.js';

/**
 * Transform known attribute alues to their preferred formats.
 */
const mapAttrs = (attrs) => {
  const out = {};
  for (const key in attrs) {
    const val = attrs[key];
    if (key === 'src') out.source = val;
    else if (key === 'style' || key === '@style') out.styles = parseStyle(val);
    else if (key === 'html') out.html = val;
    else if (key === 'width') out.width = parseInt(val, 10);
    else out[key] = val;
  }
  return out;
};

/**
 * Default emitter target for all content blocks/contexts
 */
class DefaultJSONTarget {

  openBlock(type, attrs) {
    const block = {
      type,
      ...mapAttrs(attrs)
    };
    return block;
  }

  writeContent(block, content) {
    block.content = content;
  }

  closeBlock(parent, block) {
    parent.contents = parent.contents ? [...parent.contents, block] : [block];
  }
};

/**
 * Emitter target for HTML content blocks.
 */
class HTMLTarget extends DefaultJSONTarget {
  writeContent(block, content) {
    block.html = content;
  }
}

/**
 * Emitter target for text content blocks.
 */
class TextTarget extends DefaultJSONTarget {
  writeContent(block, content) {
    block.text = content;
  }
}

/**
 * Emitter target for column-layout blocks.
 */
class ColumnLayoutTarget extends DefaultJSONTarget {

  openBlock(type, attrs) {
    const block = {
      type,
      ...mapAttrs(attrs)
    };
    block.columns = [];
    return block;
  }

  closeBlock(parent, block) {
    parent.columns.push(block);
  }
};

/**
 * Instance of DefaultJSONTarget used whenever a specialized
 * block emitter target isn't required.
 */
const defaultTarget = new DefaultJSONTarget();

/**
 * Map of block types to their emitter target instances
 */
const BLOCK_EMITTER_TARGETS = {
  'column-layout': new ColumnLayoutTarget(),
  'html': new HTMLTarget(),
  'text': new TextTarget()
};

/**
 * Resolve the emitter target for a given block type.
 *
 * If the block type is not recognized, the default target is returned.
 */
const resolveEmitterTarget = (blockType) => {
  return BLOCK_EMITTER_TARGETS[blockType] ?? defaultTarget;
};

/**
 * Create a little function fake-instance that serves an emitter target
 * for producing the Heed JSON format from the Intermediary Representation
 * emitted by the parser.
 */
export const createJSONTarget = () => {
  const stack = [];

  let slide = {
    type: 'default',
    name: '',
    id: '',
    notes: '',
    contents: []
  };

  return {
    setMeta(meta) {
      slide = {
        ...slide,
        ...meta,
        contents: []
      };
    },

    openBlock(type, attrs) {
      const target = resolveEmitterTarget(type);
      const block = target.openBlock(type, attrs);
      stack.push({ block, target });
    },

    writeContent(content) {
      const { block, target } = stack.at(-1);
      if (!block) throw new Error('writeContent() with no open block');
      target.writeContent(block, content);
    },

    closeBlock() {
      const { block, target } = stack.pop();
      if (stack.length > 0) {
        const { block: parentBlock, target: parentTarget } = stack.at(-1);
        parentTarget.closeBlock(parentBlock, block);
      } else {
        slide.contents.push(block);
      }
    },

    openPhases() {
      slide.steps = [];
    },

    addPhase(id, transitions) {
      const step = { id };
      if (Object.keys(transitions).length) {
        step.transitions = {};
      }
      for (const [target, styles] of Object.entries(transitions)) {
        step.transitions[target] = [
          styles.enter || {},
          styles.rewind || {}
        ];
      }
      slide.steps.push(step);
    },

    closePhases() {
      // no-op
    },

    done() {
      // no-op
    },

    getJSON() {
      return slide;
    }
  };
};
