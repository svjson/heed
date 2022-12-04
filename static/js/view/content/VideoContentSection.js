(function() {

  class VideoContentSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      if (window.videoListener) {
        document.removeEventListener('keydown', window.videoListener);
      }


      let videoEl = document.createElement('video'),
          sourceTag = document.createElement('source'),
          namespace = {};

      if (this.section.id) {
        namespace[this.section.id] = videoEl;
      }

      let autoplay = this.section.autoplay === false ? false : true;
      videoEl.autoplay = autoplay;
      window.isVideoPlaying = autoplay;
      videoEl.width = this.section.width ? '' + this.section.width : '900';

      let videoSrc = this.slide.path + this.section.source;
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
