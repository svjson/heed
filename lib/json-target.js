import { parseStyle } from './common.js';

const BLOCK_TYPE = {
  'html': 'html',
  'text': 'text',
}

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
}

/**
 * Create a little fake-function instance that serves an emitter target
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
      const block = {
        type,
        ...mapAttrs(attrs)
      };
      block.contents = [];
      stack.push(block);
    },

    writeContent(content) {
      const top = stack[stack.length - 1];
      if (!top) throw new Error('writeContent() with no open block');
      if (BLOCK_TYPE[top.type]) {
        top[BLOCK_TYPE[top.type]] = content;
      } else {
        top.content = content;
      }
    },

    closeBlock() {
      const block = stack.pop();
      if (stack.length > 0) {
        stack[stack.length - 1].contents.push(block);
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
}
