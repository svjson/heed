import { execAsync, isOnPath } from './process.js';
import unidecode from 'unidecode';

/**
 * Command to create a TAR archive.
 */
const tarArchiveCommand = {
  command: 'tar',
  noOpFlag: '--help',
  packArgs: (fileName, excludes, cwd) => [
    'tar',
    ...excludes.map(item => `--exclude=./${item}`),
    '-cf',
    fileName,
    '-c',
    cwd
  ].join(' '),
};

/**
 * Command to create a TGZ archive.
 */
const tgzArchiveCommand = {
  command: 'tar',
  noOpFlag: '--help',
  packArgs: (fileName, excludes, cwd) => [
    'tar',
    ...excludes.map(item => `--exclude=./${item}`),
    '-czf',
    fileName,
    '-c',
    cwd
  ].join(' ')
}

/**
 * Command to create a ZIP archive.
 */
const zipArchiveCommand = {
  command: 'zip',
  noOpFlag: '--help',
  packArgs: (fileName, excludes) => [
    'zip',
    '-r',
    fileName,
    '.',
    '-x',
    ...excludes.map(item => `"./${item}"`),
  ].join(' ')
}

/**
 * Supported archive formats and their commands.
 */
const archiveCommands = {
  'tar': tarArchiveCommand,
  'tgz': tgzArchiveCommand,
  'zip': zipArchiveCommand
};

/**
 * Resolve the appropriate archive command based on the archive type.
 *
 * @param {string} archiveType - The type of archive to create (e.g., 'zip', 'tar', 'tgz').
 * @return {Object} - The command object containing the command name and arguments function.
 */
export const resolveArchiveCommand = (archiveType) => {
  const command = archiveCommands[archiveType];
  if (!command) {
    throw new Error(`Unsupported archive format: ${archiveType}`);
  }
  if (!isOnPath(command)) {
    throw new Error(`${command.command} executable not found on PATH.`);
  }
  return command;
};

/**
 * Create an archive using the specified command and options.
 *
 * @param {Object} command - The command object containing the command
 *                           name and arguments function.
 * @param {string} fileName - The name of the archive file to create.
 * @param {Object} opts - Options for the archive creation.
 * @param {string[]} [opts.exclude] - List of files or directories to
 *                                    exclude from the archive.
 * @param {string} [opts.cwd] - The current working directory to use for
 *                              the archive creation.
 * @throws {Error} - Throws an error if the archive creation fails.
 */
export const createArchive = async (command, fileName, opts) => {
  const cwd = opts.cwd ?? '.';
  const cmd = command.packArgs(
    fileName,
    opts.exclude ?? [],
    cwd
  );
  try {
    await execAsync(cmd, { cwd });
  } catch (error) {
    throw new Error(`Failed to create archive: ${error.message}`);
  }
};

/**
 * Sanitize a filename by removing unwanted characters and formatting.
 *
 * Attempts to make the filename URL-friendly and safe for file systems.
 * Replacing escape characters, emojis, and other special characters
 * as well as using unidecode to convert non-ASCII characters to ASCII
 * and latinizing cyrillic, greek, arabic, and other scripts.
 *
 * @param {string} input - The input string to sanitize.
 * @return {string} - The sanitized filename.
 */
export const sanitizeFilename = (input) => {
  return unidecode(
    input
      .replace(/\s*@\s*/g, ' at ')
      .replace(/\s*&\s*/g, ' and ')
      .normalize('NFKD')
      .replace(/[_–—]+/g, ' ')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, 'x')
      .replace(/[\uE000-\uF8FF]/g, 'x')
  )
    .replace(/[\/\\?%*:;,#^|+=~`"<>!\$\[\]\(\)\{\}]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[.]/g, '')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase();
};
