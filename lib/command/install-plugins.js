import { installPlugins as installAllPlugins } from '../plugin.js';
import { loadPresentation } from '../presentation.js';

/**
 * Installs all plugins referred to in the `presentation.json` at
 * `presentationRoot`, or verifies that they are already installed.
 *
 * This function will return a message indicating the success of the
 * installation, and a list of installed plugins.
 *
 * @param {string} presentationRoot - The root directory of the presentation.
 * @param {Object} options - Command options.
 * @param {string} options.heedRoot - The root directory of the Heed package.
 *
 * @return {Promise<Object>} - A promise that resolves to an object containing
 */
export const installPlugins = async (presentationRoot, options) => {
  const presentation = await loadPresentation(presentationRoot);

  const installed = await installAllPlugins(
    presentationRoot,
    presentation,
    options.heedRoot
  );

  if (!installed.length) {
    return {
      message: 'Nothing new to install'
    };
  }

  return {
    message: `Successfully installed plugins: ${installed.join(', ')}`,
    installedPlugins: installed
  };
};
