import os from 'os';
import path from 'path';
import { readFile, cp, rm, mkdtemp } from 'fs/promises';

import { loadPresentation, savePresentationDotJson } from '../presentation.js'
import { ensurePluginDir, findPluginJson, installInPlace } from '../plugin.js';
import { downloadFile, unzipTo } from '../download.js';

/**
 * Install a plugin by name/id into the presentation at presentationRoot.
 *
 * Supported sources are:
 * - A URL to a ZIP file containing the plugin
 * - A local path to a ZIP file containing the plugin
 * - A local path to a directory containing the plugin
 *
 * If no source is provided, the function will look for the plugin in the
 * static plugins.json file in the heed root directory.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} sourceArg - Optional source URL or path for the plugin.
 * @param {Object} options - Command options
 */
export const addPlugin = async (
  presentationRoot,
  pluginName,
  sourceArg,
  options
) => {
  const presJson = await loadPresentation(presentationRoot);

  if (presJson?.plugins?.[pluginName]) {
    throw new Error(`Plugin '${pluginName}' is already installed in this presentation.`);
  }

  const source = await resolvePluginSource(pluginName, sourceArg, options);
  const sourceType = determineSourceType(source);

  const { installedPath, defaultConfig }  = await installFromSource(presentationRoot, pluginName, source, sourceType);

  presJson.plugins = presJson.plugins || {};
  presJson.plugins[pluginName] = defaultConfig;
  await savePresentationDotJson(presentationRoot, presJson);

  return {
    message: `Installed plugin '${pluginName}' in '${installedPath}'`
  };
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
const resolvePluginSource = async (pluginName, source, options) => {
  if (!source) {
    const pluginsDotJSON = await readFile(path.join(options.heedRoot, 'plugins.json'), 'utf-8');
    const plugins = JSON.parse(pluginsDotJSON);

    if (!plugins[pluginName]) {
      throw new Error(`Unknown plugin '${pluginName}'. If the plugin exists, you must provide a source.`);
    }

    return plugins[pluginName];
  }
  return source;
}

/**
 * Determine the type of the source based on its format.
 *
 * @param {string} source - The source URL or path.
 *
 * @return {string} - The type of the source: 'url', 'local', or 'zip'.
 */
const determineSourceType = (source) => {
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
const installFromSource = async (presentationRoot, pluginName, source, sourceType) => {
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
}

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
 * `installInPlace` from `plugin.js` is called to finalize the installation.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to install.
 * @param {string} source - The local path to the plugin directory.
 *
 * @return {Promise<Object>} - An object containing the installed path and default
 */
const installFromPath = async (presentationRoot, pluginName, source) => {
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
  await cp(source, path.join(pluginDir, pluginName), { recursive: true });

  installInPlace(targetPath);

  return { installedPath: targetPath, defaultConfig: pluginDotJson.defaultConfig ?? {} };
};
