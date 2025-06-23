export class VideoDestroyHook {
  constructor(opts) {
    Object.assign(this, opts);
  }

  applyHook() {
    const _videoEl = document.querySelector('video');

    if (window.videoListener) {
      document.removeEventListener('keydown', window.videoListener);
    }
  }

}
