(function() {

  class ImageContentSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      const [imageEl, namespace] = this.createMainElement('img', {
        id: this.section.id,
        src: `${this.slide.path}${this.section.source}`,
        width: this.section.width,
        height: this.section.height
      });

      this.applyCommonProperties(imageEl);

      el.appendChild(imageEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('image', ImageContentSection);

})();
