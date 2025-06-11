(function() {

  class VideoContentSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      if (window.videoListener) {
        document.removeEventListener('keydown', window.videoListener);
      }
      const autoplay = this.section.autoplay === false ? false : true;

      const [videoEl, namespace] = document.createElement('video', {
        autoplay: autoplay,
        isVideoPlaying: autoplay,
        width: this.section.width ? '' + this.section.width : '900'
      });
      const sourceTag = document.createElement('source');

      const videoSrc = this.slide.path + this.section.source;
      if (this.section.startTime) {
        videoSrc += '#t=' + this.section.startTime;
        videoEl._startTime = this.section.startTime;
      }
      sourceTag.src = videoSrc;
      sourceTag.type = "video/webm";

      videoEl.appendChild(sourceTag);
      el.appendChild(videoEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('video', VideoContentSection);

})();
