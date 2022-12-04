(function() {

  class ColumnLayoutSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      let tableEl = document.createElement('table'),
          rowEl = document.createElement('tr'),
          namespace = {};

      this.applyCommonProperties(tableEl);

      if (this.section.id) {
        namespace[this.section.id] = tableEl;
      }

      tableEl.setAttribute("class", "column-layout-table");

      this.section.columns.forEach((col) => {
        let colEl = document.createElement('td');
        if (col.styles) Object.assign(colEl.style, col.styles);
        col.contents.forEach((section) => {

          let sectionEl = Heed.ContentSectionFactory.buildSection({
            section: section,
            slide: this.slide
          });

          this.applyCommonProperties.call({ section: col }, sectionEl);

          if (col.id) {
            this.slide.namespace[col.id] = sectionEl;
          }

          colEl.appendChild(sectionEl);
        });

        rowEl.appendChild(colEl);
      });

      tableEl.appendChild(rowEl);
      el.appendChild(tableEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('column-layout', ColumnLayoutSection);

})();
