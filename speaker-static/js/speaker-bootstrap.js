
import { SpeakerView, THEMES } from './view/SpeakerView.js';
import { Presentation } from '../../slide-viewer-static/js/models/index.js';
import { WebSocketClient } from '../../slide-viewer-static/js/ws/WebSocketClient.js';

/**
 * Bootstrapper listener that loads the presentation and sets up
 * a WS connection with server once the browser has signalled that
 * the DOM is ready.
 *
 * Also triggers a reload of the presentation and/or webapp files
 * after an update has been signalled.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('heed-speaker-notes-theme') ?? '';
  const currentTheme = THEMES[savedTheme] ? savedTheme : '';
  document.body.classList.toggle('theme-dark', currentTheme === 'theme-dark');

  const presentation = await Presentation.load({ notes: true });

  const wsClient = new WebSocketClient({ actor: 'speaker' });
  await wsClient.connect();

  const speakerView = new SpeakerView({
    el: document.querySelector('#speaker-container'),
    presentation,
    wsClient
  });

  wsClient.on('speaker-notes-updated', () => {
    window.location.reload();
  });

  wsClient.on('presentation-updated', async _event => {
    speakerView.replacePresentation(await Presentation.load({ notes: true }));
  });

  window.addEventListener('resize', () => {
    speakerView.resize();
  });
});
