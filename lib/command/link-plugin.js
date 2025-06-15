import {
    determineSourceType,
  installFromPath,
  resolvePluginSource,
  verifyNotInstalled
} from '../plugin.js';
import {
  loadPresentation,
  addPluginConfiguration
}
from '../presentation.js';

export const linkPlugin = async (
  presentationRoot,
  pluginName,
  sourceArg,
  options
) => {
  const presJson = await loadPresentation(presentationRoot);

  verifyNotInstalled(presJson, pluginName);

  const source = await resolvePluginSource(pluginName, sourceArg, options.heedRoot);
  const sourceType = determineSourceType(source);

  if (sourceType !== 'local') {
    throw new Error('Can only link plugins from local folders.');
  }

  const { installedPath, defaultConfig } =
    await installFromPath(presentationRoot, pluginName, source, true);

  await addPluginConfiguration(presentationRoot, presJson, pluginName, defaultConfig);

  return {
    message: `Linked plugin '${pluginName}' in '${installedPath}' to '${source}'`
  };
};
