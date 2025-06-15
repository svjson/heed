import path from 'path';
import { exec } from 'child_process';
import { mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Supported package managers and their no-op commands (used to
 * verify their presence by checking if they can be executed)
 */
const pkgCommands = [
  { command: 'yarn', noOpFlag: '--help' },
  { command: 'npm', noOpFlag: '--help' }
];

/**
 * Ensure the plugins directory exists in the given presentation root.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 *
 * @return {Promise<string>} - The path to the plugins directory.
 */
export const ensurePluginDir = async (presentationRoot) => {
  const pluginDir = path.join(path.resolve(presentationRoot), 'plugins');
  if (!existsSync(pluginDir)) {
    await mkdir(pluginDir);
  }
  return pluginDir;
}

/**
 * Check if a command is available on the system's PATH.
 *
 * This function tries to execute the command with an optional no-op flag.
 *
 * @param {string} command - The command to check.
 * @param {string} noOpCmd - An optional no-op command to append to the check.
 *
 * @return {Promise<boolean>} - Returns true if the command is found, false otherwise.
 */
const isOnPath = async (command, noOpCmd) => {
  try {
    const cmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
    await execAsync(noOpCmd ? [cmd, noOpCmd].join(' ') : cmd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the appropriate package manager command to use.
 *
 * This function checks the system's PATH for known package managers
 * and returns the first one that is available.
 *
 * @return {Promise<Object>} - Returns an object containing the command and no-op flag
 *                             of the found package manager.
 * @throws {Error} - Throws an error if no package manager is found on the PATH.
 */
const resolvePkgCommandExec = async() => {
  for (const cmd of pkgCommands) {
    if (await isOnPath(cmd.command, cmd.noOpFlag)) {
      return cmd;
    }
  }

  throw new Error('No nodejs package manager available on path. Tried: ' + pkgCommands.map(cmd => cmd.command).join(', '));
}

/**
 * Install dependencies in the specified target path using a
 * package manager command resolved from the PATH of the environment.
 *
 * @param {string} targetPath - The path where the dependencies should be installed.
 *
 * @throws {Error} - Throws an error if the installation command fails.
 */
export const installInPlace = async(targetPath) => {
  if (!existsSync(path.join(targetPath, 'package.json'))) return;

  const pkgCommand = await resolvePkgCommandExec();

  const cmd = [pkgCommand.command, 'install'].join(' ');

  try {
    await execAsync(cmd, { cwd: targetPath });
  } catch (e) {
    throw new Error(`${cmd} failed:  ${e}`);
  }
}

/**
 * Recursively find the plugin.json file in the specified directory.
 *
 * @param {string} dir - The directory to start searching from.
 *
 * @return {Promise<string|null>} - Returns the path to the directory containing plugin.json,
 *                                  or null if not found.
 */
export const findPluginJson = async (dir) => {
  const pluginJsonPath = path.join(dir, 'plugin.json');
  if (existsSync(pluginJsonPath)) {
    return dir;
  }

  const subdirs = await readdir(dir, { withFileTypes: true });
  for (const subdir of subdirs) {
    if (subdir.isDirectory()) {
      const result = await findPluginJson(path.join(dir, subdir.name));
      if (result) return result;
    }
  }

  return null;
};

