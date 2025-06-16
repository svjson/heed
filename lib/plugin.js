import path from 'path';
import { exec } from 'child_process';
import { cp, mkdir, readdir, readFile, symlink } from 'fs/promises';
import { existsSync } from 'fs';

import { execAsync, isOnPath } from './process.js';

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
const installInPlace = async(targetPath) => {
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
 * Resolve the source of a plugin by name, or provided source.
 *
 * @param {string} pluginName - The name/id of the plugin.
 * @param {string} source - Optional source URL or path for the plugin.
 * @param {Object} options - Command options
 *
 * @return {Promise<string>} - The resolved source URL or path.
 */
export const resolvePluginSource = async (pluginName, source, heedRoot) => {
  if (!source) {
    const pluginsDotJSON = await readFile(path.join(heedRoot, 'plugins.json'), 'utf-8');
    const plugins = JSON.parse(pluginsDotJSON);

    if (!plugins[pluginName]) {
      throw new Error(`Unknown plugin '${pluginName}'. If the plugin exists, you must provide a source.`);
    }

    return plugins[pluginName];
  }
  return source;
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

/**
 * Verify that a plugin is not already installed in the presentation.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {Object} presJson - The presentation JSON object.
 * @param {string} pluginName - The name of the plugin to check.
 *
 * @throws {Error} - Throws an error if the plugin is already installed.
 */
export const verifyNotInstalled = (presentationRoot, presJson, pluginName) => {
  if (presJson?.plugins?.[pluginName] && existsSync(path.join(path.resolve(presentationRoot), 'plugins', pluginName))) {
    throw new Error(`Plugin '${pluginName}' is already installed in this presentation.`);
  }
}

/**
 * Determine the type of the source based on its format.
 *
 * @param {string} source - The source URL or path.
 *
 * @return {string} - The type of the source: 'url', 'local', or 'zip'.
 */
export const determineSourceType = (source) => {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return 'url';
  } else if (/^([a-z]+:)?\/\//.test(source)) {
    throw new Error(`Unsupported protocol: ${source.split('://')[0]}`);
  } else if (source.toLowerCase().endsWith('.zip')) {
    return 'zip';
  }
  return 'local';
};

/**
 * Install a plugin from a local path by reading the plugin.json file,
 * validating the plugin ID, and copying the plugin files to the
 * presentation's plugin directory.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} source - The local path to the plugin directory.
 * @param {boolean} symlink - Whether to create a symlink instead of copying files.
 *
 * @return {Promise<Object>} - An object containing the installed path and default
 */
export const installFromPath = async (presentationRoot, pluginName, source, bySymlink=false) => {
  let pluginDotJson = null;
  try {
    pluginDotJson = JSON.parse(await readFile(path.join(source, 'plugin.json')));
  } catch (e) {
    throw new Error(`Unable to read plugin.json: ${e}`);
  }

  if (pluginDotJson.pluginId !== pluginName) {
    throw new Error(`Plugin IDs do not match. Provided: '${pluginName}' vs plugin.json: '${pluginDotJson.pluginId}'.`);
  }

  const pluginDir = await ensurePluginDir(presentationRoot);
  const targetPath = path.join(pluginDir, pluginName);
  if (bySymlink) {
    await symlink(source, path.join(pluginDir, pluginName));
  } else {
    await cp(source, path.join(pluginDir, pluginName), { recursive: true });
  }

  installInPlace(targetPath);

  return { installedPath: targetPath, defaultConfig: pluginDotJson.defaultConfig ?? {} };
};
