import { existsSync } from 'fs';
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink
} from 'fs/promises';
import os from 'os';
import path from 'path';

import { downloadFile, unzipTo } from './download.js';
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
};

/**
 * Resolve the appropriate package manager command to use.
 *
 * This function attempts to locate a package manager by looking in the bin folder
 * from which the node process is running, with a fallback on the env PATH available
 * to the process for known package managers.
 *
 * Returns the first one that is available.
 *
 * @return {Promise<Object>} - Returns an object containing the command and no-op flag
 *                             of the found package manager.
 * @throws {Error} - Throws an error if no package manager is found on the PATH.
 */
const resolvePkgCommandExec = async() => {
  for (const cmd of pkgCommands) {
    const execPathCmd = path.join(path.dirname(process.execPath), cmd.command);
    if (existsSync(execPathCmd)) {
      return { ...cmd, command: execPathCmd };
    }
    if (await isOnPath(cmd.command, cmd.noOpFlag)) {
      return cmd;
    }
  }
  throw new Error('No nodejs package manager available on path. Tried: ' + pkgCommands.map(cmd => cmd.command).join(', '));
};

/**
 * Install presentation plugins.
 */
export const installPlugins = async (presentationRoot, presentation, heedRoot) => {
  const installed = [];

  for (const pluginId of Object.keys(presentation.plugins ?? {})) {
    if (!isPluginPresentInFolder(presentationRoot, pluginId)) {
      const source = await resolvePluginSource(pluginId, null, heedRoot);
      installFromSource(presentationRoot, pluginId, source, determineSourceType(source));
      installed.push(pluginId);
    }
  }

  return installed;
};

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
};

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
};

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
 * Check if a plugin is present in the plugins folder of the presentation.
 *
 * Folder layout and presentation.json may be out of sync, or a presentation
 * has been distributed without plugins. This makes querying both `presentation.plugins`
 * and present folders a common concern.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginId - The ID of the plugin to check.
 * @return {boolean} - Returns true if the plugin is present in the plugins folder,
 *                     false otherwise.
 */
export const isPluginPresentInFolder = (presentationRoot, pluginId) => {
  return existsSync(path.join(path.resolve(presentationRoot), 'plugins', pluginId));
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
  if (presJson?.plugins?.[pluginName] && isPluginPresentInFolder(presentationRoot, pluginName)) {
    throw new Error(`Plugin '${pluginName}' is already installed in this presentation.`);
  }
};

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
 * Install a plugin from a given source and source type.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} source - The source URL or path for the plugin.
 * @param {string} sourceType - The type of the source: 'url', 'local', or 'zip'.
 *
 * @return {Promise<Object>} - An object containing the installed path and default
 *                             configuration of the plugin.
 */
export const installFromSource = async (
  presentationRoot,
  pluginName,
  source,
  sourceType
) => {
  switch (sourceType) {
  case 'url':
    return await installFromUrl(presentationRoot, pluginName, source);
  case 'local':
    return await installFromPath(presentationRoot, pluginName, source);
  case 'zip':
    return await installFromZip(presentationRoot, pluginName, source);
  default:
    throw new Error('Unknown source');
  }
};

/**
 * Install a plugin from a URL by downloading it as a ZIP file,
 * unzipping it, and installing it from the extracted directory.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} source - The URL to download the plugin from.
 *
 * @return {Promise<Object>} - An object containing the installed path and default
 *                             config.
 */
const installFromUrl = async (presentationRoot, pluginName, source) => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'heed-plugin-'));
  try {
    const zipPath = path.join(tmpDir, `heed-${pluginName}.zip`);

    await downloadFile(source, zipPath);

    return await installFromZip(presentationRoot, pluginName, zipPath);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
};

/**
 * Install a plugin from a ZIP file by unzipping it and finding the plugin.json file,
 * before handing over to `installFromPath`.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} source - The path to the ZIP file containing the plugin.
 *
 * @return {Promise<Object>} - An object containing the installed path and default
 */
const installFromZip = async (presentationRoot, pluginName, source) => {
  const unzippedFolder = await unzipTo(source);
  const sourceDir = await findPluginJson(unzippedFolder);
  if (!sourceDir) {
    throw new Error('Downloaded ZIP Archive does not contain a plugin.');
  }
  return await installFromPath(presentationRoot, pluginName, sourceDir);
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

  await installInPlace(targetPath);

  return { installedPath: targetPath, defaultConfig: pluginDotJson.defaultConfig ?? {} };
};
