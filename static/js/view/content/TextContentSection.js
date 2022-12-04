(function() {

  class TextContentSection extends Heed.AbstractContentSection {

    renderTo(el) {
      let textEl = document.createElement('div'),
          namespace = {};

      if (this.section.id) {
        namespace[this.section.id] = textEl;
      }

      this.applyCommonProperties(textEl);
      textEl.innerText = this.section.text;

      el.appendChild(textEl);

      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('text', TextContentSection);

})();
