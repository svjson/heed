
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

const _formatSlide = (opts) => {

  const { title, error, contextMessage, extra=[] } = opts;

  return {
    title: title,
    contents: [{
      type: 'html',
      html: `<h2>${error}</h2>`,
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
    },
    ...extra]
  };

};

/**
 * Creates a slide that displays a parse error message with context information.
 * This slide is used when an error occurs while parsing a slide file.
 *
 * @param {HeedParseError} parseError - The error object containing details about the parse error.
 * @param {string} fileName - The name of the file where the error occurred.
 *
 * @return {object} - A slide object formatted for display, containing the error message and context.
 */
const makeParseErrorSlide = (parseError, fileName) => {
  const lineLength = [fileName, ...parseError.contextMessage?.split('\n') ?? []]
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

  return _formatSlide({
    title: 'Slide Parse Error',
    error: parseError,
    contextMessage,
  });
};

/**
 * Creates a slide that displays a generic error message with optional context.
 * This is used when an unexpected, non-structured error occurs while parsing.
 *
 * @param {Error|string|object} error - The error object or message to display.
 * @param {string} fileName - The name of the file where the error occurred.
 *
 * @return {object} - A slide object formatted for display, containing the error message and context.
 */
const makeGenericErrorSlide = (error, fileName) => {
  let errorMessage = '';
  let stack = '';

  if (error instanceof Error) {
    errorMessage = error.message;
    stack = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = JSON.stringify(error, null, 2);
  }

  const contextMessage = [
    fileName,
    '-'.repeat(fileName.length),
    stack
  ].join('\n');

  console.error(error);

  return _formatSlide({
    title: 'Unexpected Error',
    error: errorMessage,
    contextMessage,
    extra: [{
      type: 'html',
      html: 'Something went wrong that Heed didn’t anticipate. Please report it on the Heed <a href="https://github.com/svjson/heed/issues">GitHub issue tracker</a>.',
      styles: {
        fontSize: '20px'
      }
    }]
  });

};

/**
 * Creates a slide that displays an error message based on the type of error encountered.
 *
 * If the error is a `HeedParseError`, a parse error slide will be crated using the
 * structured information carried by the error. Otherwise, a generic error slide will
 * be created using the error message and stack trace.
 *
 * @param {Error} error - The error object to process.
 * @param {string} fileName - The name of the file where the error occurred.
 *
 * @return {object} - A slide object formatted for display, containing the error message
 * and context.
 */
export const makeErrorSlide = (error, fileName) => {
  if (error instanceof HeedParseError) {
    return makeParseErrorSlide(error, fileName);
  }

  return makeGenericErrorSlide(error, fileName);
};
