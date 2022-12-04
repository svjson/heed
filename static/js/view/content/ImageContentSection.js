(function() {

  class ImageContentSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      let imageEl = document.createElement('img'),
          namespace = {};

      this.applyCommonProperties(imageEl);

      if (this.section.id) {
        namespace[this.section.id] = imageEl;
        imageEl.id = this.section.id;
      }

      imageEl.src = this.slide.path + this.section.source;
      if (this.section.width) {
        imageEl.width = this.section.width;
      }
      if (this.section.height) {
        imageEl.height = this.section.height;
      }

      el.appendChild(imageEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('image', ImageContentSection);

})();
