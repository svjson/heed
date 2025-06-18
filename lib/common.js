/**
 * Combine all expressed CSS style attributes and format them nicely,
 * separated by semi-colons.
 */
export const parseStyle = (styleVal) => {
  const out = {};
  if (!styleVal) return out;
  const entries = [];
  (Array.isArray(styleVal) ? styleVal : [styleVal])
    .map(style => style.split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(e => entries.push(e)));
  for (const entry of entries) {
    const [k, ...v] = entry.split(':');
    if (k && v.length) out[k.trim()] = v.join(':').trim();
  }
  return out;
};
