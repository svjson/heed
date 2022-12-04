(function() {

  class HTMLContentSection extends Heed.AbstractContentSection {

    renderTo(el) {
      let htmlEl = document.createElement('div'),
          namespace = {};
      if (this.section.id) {
        namespace[this.section.id] = htmlEl;
      }
      this.applyCommonProperties(htmlEl);
      htmlEl.innerHTML = this.section.html;

      el.appendChild(htmlEl);

      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('html', HTMLContentSection);

})();
