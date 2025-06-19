/**
 * Perform the unrolling/expansion of a  %for-macro block.
 *
 * This function loops over the provided @values and emits
 * a copy of the block, interpolating any each-placeholder
 * it sees and selects any [<each>=<value>]-parameteried
 * keys.
 *
 * @param - A for-block
 *
 * @return - An array of materialized blocks according to the loop.
 */
export const expandForBlock = (block) => {
  const { each, values, type } = block.macroAttributes ?? {};
  if (!each || !values) {
    throw new Error('Missing %each or %values in :: for block');
  }
  const items = values.split(',').map(v => v.trim());

  const baseAttrs = { ...block.attributes };

  const macroAttrs = { ...block.macroAttributes };
  delete macroAttrs.each;
  delete macroAttrs.values;
  delete macroAttrs.type;

  return items.map(val => {
    const attrs = {};
    const content = typeof block.content === 'string' ? block.content.replaceAll(`{${each}}`, val) : block.content;

    for (const key in baseAttrs) {
      const raw = baseAttrs[key];

      const paramMatch = key.match(/^([^\s=]+)(\[[^\]]*\])|([^\s=]+)$/);
      const indexMatch = key.match(/^([a-zA-Z0-9_-]+)\{([^\}]+)\}\.([a-zA-Z0-9_-]+)$/);
      if (paramMatch && paramMatch[1] && paramMatch[2]) {
        if (paramMatch[2] === `[${each}=${val}]`) {
          const paramRootKey = paramMatch[1];
          let currentValue = block.attributes[paramRootKey];
          if (currentValue && Array.isArray(currentValue)) {
            currentValue = [...currentValue, baseAttrs[key]];
          } else {
            currentValue = currentValue ? [currentValue, baseAttrs[key]] : currentValue;
          }
          attrs[paramRootKey] = currentValue;
        }
      } else if (indexMatch) {
        if (indexMatch[2].match(/^\d+$/)) {
          attrs[key] = raw;
        } else if (indexMatch[2] === each) {
          attrs[key.replaceAll(`{${each}}`, `{${val}}`)] = baseAttrs[key];
        } else {
          const exprPattern = new RegExp(`^${each}([+-])(\\d+)$`);
          const match = indexMatch[2].match(exprPattern);
          if (match) {
            const oper = match[1];
            const amount = parseInt(match[2], 10);
            const valNum = parseInt(val, 10);
            let result = valNum;
            switch (oper) {
            case '+':
              result += amount;
              break;
            case '-':
              result -= amount;
              break;
            case '*':
              result *= amount;
              break;
            case '/':
              result /= amount;
              break;
            default:
              continue;
            }
            attrs[key.replaceAll(`{${indexMatch[2]}}`, `{${result}}`)] = baseAttrs[key];
          }
        }
      } else {
        attrs[key] = typeof raw === 'string' ? raw.replaceAll(`{${each}}`, val) : raw;
      }
    }

    const result = {
      type: type,
      attributes: {
        ...attrs,
      },
      macroAttributes: {
        ...macroAttrs
      },
      depth: block.depth,
      children: []
    };

    if (content !== null || content !== undefined) {
      result.content = content;
    }

    return result;
  });
};
