(function() {

  class VideoDestroyHook {
    constructor(opts) {
      Object.assign(this, opts);
    }

    applyHook() {
      let videoEl = document.querySelector('video');

      if (window.videoListener) {
        document.removeEventListener('keydown', window.videoListener);
      }
    }

  }



})();
