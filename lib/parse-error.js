
/**
 * HeedParseError class to represent errors encountered during parsing of Heed slides.
 *
 * It supports encoding error details such as line number and source reference in the
 * error.
 *
 * Primarily produced by `raiseError`.
 */
class HeedParseError extends Error {
  constructor(msg, details) {
    super(msg);
    this.line = details?.line;
    this.contextMessage = details?.contextMessage;
    this.contextLines = details?.contextLines;
  }
}

/**
 * Throws a HeedParseError with contextual information about the error encountered
 * during parsing.
 *
 * @param {string} msg - The error message to display.
 * @param {number} line - The line number where the error occurred (0-indexed).
 * @param {string} source - The full source file content string where the error occurred.
 *
 * @throws {HeedParseError} - Throws a HeedParseError with the provided message,
 */
export const raiseError = (msg, line, source) => {
  const contextLines = [];

  const lines = source.split('\n');
  for (let i=Math.max(line-3, 0); i < Math.min(lines.length, line+2); i++) {
    contextLines.push({
      line: i,
      content: lines[i],
      marker: (i === line ? '>>>' : '')
    });
  }

  const contextMessage = contextLines
    .map(({ marker, line, content}) => [
      String(line).padStart(4).padEnd(5),
      marker.padEnd(4),
      content
    ].join(''))
    .join('\n');

  console.error('');
  console.error(msg);
  console.error('-'.repeat(msg.length));
  console.error(contextMessage);

  throw new HeedParseError(msg, {
    line,
    contextMessage,
    contextLines
  });
};

/**
 * Creates a slide that displays a parse error message with context information.
 * This slide is used when an error occurs while parsing a slide file.
 */
export const makeParseErrorSlide = (parseError, data, fileName) => {
  const lineLength = [fileName, ...parseError.contextMessage.split('\n')]
    .reduce((len, line) => Math.max(len, line.length), 0);

  const contextMessage = [
    fileName,
    '-'.repeat(lineLength),
    parseError.contextLines.reduce((result, { marker, line, content }) => {
      return result + [
        `<span style="color: ${marker.length ? '#faa' : '#aaf' }">${String(line).padStart(4).padEnd(5)}</span>`,
        marker.padEnd(4),
        content
      ].join('') + '\n';
    }, '')
  ].join('\n');

  return {
    title: 'Slide Parse Error',
    contents: [{
      type: 'html',
      html: `<h2>${parseError}</h2>`,
      styles: {
        'fontSize': '20px'
      }
    }, {
      type: 'html',
      html: `<pre><code>${contextMessage}</code></pre>`,
      styles: {
        'text-align': 'left',
        'padding': '30px',
        'font-size': '25px',
        'border': '2px solid black',
        'color': '#fee',
        'background-color': '#333'
      }
    }]
  };
};
