(function() {

  class HTMLContentSection extends Heed.AbstractContentSection {

    renderTo(el) {
      const [htmlEl, namespace] = this.createMainElement('div');

      this.applyCommonProperties(htmlEl);
      htmlEl.innerHTML = this.section.html;

      el.appendChild(htmlEl);
      return namespace;
    }
  }

  Heed.ContentSectionRegistry.register('html', HTMLContentSection);

})();
