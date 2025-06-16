import { determineSourceType, isPluginPresentInFolder, resolvePluginSource } from "../plugin.js";
import { loadPresentation } from "../presentation.js"
import { installFromSource } from "./add-plugin.js";

export const installPlugins = async (presentationRoot, options) => {
  const presentation = await loadPresentation(presentationRoot);

  const installed = [];

  for (const pluginId of Object.keys(presentation.plugins ?? {})) {
    if (!isPluginPresentInFolder(presentationRoot, pluginId)) {
      const source = await resolvePluginSource(pluginId, null, options.heedRoot);
      installFromSource(presentationRoot, pluginId, source, determineSourceType(source))
      installed.push(pluginId);
    }
  }

  if (!installed.length) {
    return {
      message: 'Nothing new to install'
    }
  }

  return {
    message: `Successfully installed plugins: ${installed.join(', ')}`,
    installedPlugins: installed
  };
}
