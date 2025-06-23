
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
          const navigator = new Heed.WebSocketNavigator({ actor: 'presentation' });
          navigator.connect().then(() => {
            const mainView = new Heed.PresentationView({
              presentation: instance,
              navigator: navigator
            });
          });
        });
      });
    });
  });
});
