export const raiseError = (msg, line, source) => {
  console.error(msg);
  console.error('-'.repeat(msg.length));
  const lines = source.split('\n');
  for (let i=Math.max(line-2, 0); i < Math.min(lines.length, line+2); i++) {
    console.error((i === line ? '>>> ' :'   ') + lines[i]);
  }

  throw new Error(msg);
};
