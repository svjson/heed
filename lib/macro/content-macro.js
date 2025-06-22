
export const expandContentMacro = (block, _, context, meta) => {
  const contentDirectives = Object.entries(block.macroAttributes ?? {})
    .filter(([attr, _]) => attr === 'content')
    .map(([attr, value]) => ({
      match: [attr],
      value: value
    }))
    .filter(d => d.match)
    .map(({ value }) => ({
      source: value
    }));

  contentDirectives.forEach(directive => {
    const { source } = directive;
    if (source) {
      const [sourceType, identifier] = source.split(':');
      if (sourceType === 'content') {
        block.content = meta?.content?.find(contentBlock => contentBlock.attributes?.id === identifier)?.content;
      }
    }
  });

  return block;
};
