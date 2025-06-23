(function() {

  class ChildProcessHook {
    constructor(opts) {
      Object.assign(this, opts);
    }

    applyHook() {
      if (this.start.click) {
        let el = document.querySelector('#' + this.start.click);
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          fetch('/childprocess?cmd=' + encodeURIComponent(this.cmd));
        });
      }
    }
  }

  Heed.HookRegistry.register('heed:childProcess', ChildProcessHook, ['postRender']);

})();
