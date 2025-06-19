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
export const expandAccumulateMacro = (block, _, context) => {
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

