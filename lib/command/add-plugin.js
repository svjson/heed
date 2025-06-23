import {
  determineSourceType,
  installFromSource,
  resolvePluginSource,
  verifyNotInstalled
} from '../plugin.js';
import { addPluginConfiguration, loadPresentation } from '../presentation.js';

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
};
