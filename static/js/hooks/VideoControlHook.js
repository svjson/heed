(function() {

  class VideoControlHook {
    constructor(opts) {
      Object.assign(this, opts);
    }

    applyHook() {

      let videoEl = document.querySelector('video');

      videoEl.onplay = e => window.isVideoPlaying = true;
      videoEl.onpause = e => window.isVideoPlaying = false;

      window.videoListener = e => {
        if (!videoEl) {
          document.removeEventListener('keydown', window.videoListener);
          console.log('Removed stray videocontrol listener');
          return;
        }
        if (e.altKey && e.key === 'p') {
          if (window.isVideoPlaying) {
            videoEl.pause();
          } else {
            videoEl.play();
          }
        }
        if (e.altKey && e.key === 'r') {
          videoEl.currentTime = videoEl._startTime ? videoEl._startTime : 0;
        }
      };

      document.addEventListener('keydown', window.videoListener);
    }
  }

  Heed.HookRegistry.register('heed:videocontrol', VideoControlHook, ['postRender']);

})();
