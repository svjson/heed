
import { existsSync } from 'fs';
import { rm, lstat, stat, unlink } from 'fs/promises';
import path from 'path';

import {
  loadPresentation,
  savePresentationDotJson
} from '../presentation.js';

/**
 * Remove a plugin from the presentation at `presentationRoot`.
 * This will remove the plugin from the `presentation.json`
 * and delete the plugin directory if it exists.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {string} pluginName - The name/id of the plugin to remove.
 * @param {Object} _options - Command options (not used).
 *
 * @return {Promise<Object>} - Returns an object with a success message.
 * @throws {Error} - Throws an error if the plugin is not found in the presentation.
 */
export const removePlugin = async (
  presentationRoot,
  pluginName,
  _options
) => {
  const presJson = await loadPresentation(presentationRoot);
  const pluginDir = path.resolve(path.join(presentationRoot, 'plugins', pluginName));

  const pluginDirExists = existsSync(pluginDir);

  const pluginDirStat = pluginDirExists ? await stat(pluginDir) : null;
  const isSymLink = pluginDirExists ? (await lstat(pluginDir)).isSymbolicLink() : false;

  if (!presJson?.plugins?.[pluginName] && (!pluginDirExists || (!isSymLink && !pluginDirStat.isDirectory()))) {
    throw new Error(`No plugin with name '${pluginName}' is installed in this presentation.`);
  }

  if (presJson?.plugins?.[pluginName]) {
    delete presJson.plugins[pluginName];
    await savePresentationDotJson(presentationRoot, presJson);
  }

  let operation = 'uninstalled';

  if (pluginDirExists && isSymLink) {
    operation = 'unlinked';
    await unlink(pluginDir);
  } else if (pluginDirExists && pluginDirStat.isDirectory()) {
    await rm(pluginDir, { recursive: true });
  }

  return {
    message: `Successfully ${operation} plugin '${pluginName}'.`
  };
};
