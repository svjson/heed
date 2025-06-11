(function() {

  class TextContentSection extends Heed.AbstractContentSection {

    renderTo(el) {
      const [textEl, namespace] = this.createMainElement('div');

      this.applyCommonProperties(textEl);
      textEl.innerText = this.section.text;

      el.appendChild(textEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('text', TextContentSection);

})();
