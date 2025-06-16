import os from 'os';
import path from 'path';
import { rm, mkdtemp } from 'fs/promises';

import { addPluginConfiguration, loadPresentation } from '../presentation.js'
import {
  determineSourceType,
  findPluginJson,
  installFromPath,
  resolvePluginSource,
  verifyNotInstalled
} from '../plugin.js';
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

  verifyNotInstalled(presentationRoot, presJson, pluginName);

  const source = await resolvePluginSource(pluginName, sourceArg, options.heedRoot);
  const sourceType = determineSourceType(source);

  const { installedPath, defaultConfig } =
    await installFromSource(presentationRoot, pluginName, source, sourceType);

  if (!presJson.plugins?.[pluginName]) {
    await addPluginConfiguration(presentationRoot, presJson, pluginName, defaultConfig);
  }

  return {
    message: `Installed plugin '${pluginName}' in '${installedPath}'`
  };
}

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
