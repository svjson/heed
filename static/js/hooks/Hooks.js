(function() {

  class Hooks {

    static createHook(id, cfg={}, slide) {
      return {
        id: 'hookId',
        applyHook: function() {
          let hookClass = Heed.HookRegistry.resolve(id),
            hookInstance = new hookClass(this.hookConfig, slide);
          return hookInstance.applyHook();
        },
        hookConfig: cfg
      };
    }

  }
  window.Heed.Hooks = Hooks;

})();
