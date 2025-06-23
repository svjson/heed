import { PresentationView } from './view/PresentationView.js';
import { WebSocketNavigator } from './ws/WebSocketNavigator.js';

document.addEventListener('DOMContentLoaded', function() {
  fetch('/context').then(function(ctxResp) {
    ctxResp.json().then((ctx) => {
      Heed.context = ctx;
      Heed.Presentation.load().then((instance) => {
        const hooks = Heed.HookRegistry.resolveByType('init'),
          promises = hooks.map(hookId => Heed.Hooks
            .createHook(hookId, { presentation: instance })
            .applyHook());

        Promise.all(promises).then(() => {
          const navigator = new WebSocketNavigator({ actor: 'presentation' });
          navigator.connect().then(() => {
            Heed.mainView = new PresentationView({
              presentation: instance,
              navigator: navigator
            });
          });
        });
      });
    });
  });
});
