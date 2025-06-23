import { Presentation } from './models/index.js';
import { PresentationView } from './view/PresentationView.js';
import { WebSocketClient } from './ws/WebSocketClient.js';

/**
 * Load or reload the Heed presentation instance.
 *
 * Upon a successful fetch of the `presentation.json`,
 * relevant hooks are installed before returning the instance.
 */
const initializePresentation = async () => {
  const ctxResponse = await fetch('/context');
  const ctx = await ctxResponse.json();

  Heed.context = ctx;

  const instance = await Presentation.load();
  const hooks = Heed.HookRegistry.resolveByType('init');
  await hooks.map(hookId => Heed.Hooks
    .createHook(hookId, { presentation: instance })
    .applyHook());

  return instance;
};

/**
 * Bootstrapper listener that loads the presentation and sets up
 * a WS connection with server once the browser has signalled that
 * the DOM is ready.
 *
 * Also triggers a reload of the presentation and/or webapp files
 * after an update has been signalled.
 */
document.addEventListener('DOMContentLoaded', async () => {

  const wsClient = new WebSocketClient({ actor: 'presentation' });
  await wsClient.connect();

  const mainView = new PresentationView({
    presentation: await initializePresentation(),
    navigator: wsClient
  });

  wsClient.on('presentation-updated', async _event => {
    mainView.replacePresentation(await initializePresentation());
  });

  wsClient.on('slide-viewer-updated', async () => {
    window.location.reload();
  });
});
