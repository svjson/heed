(function() {

  class ColumnLayoutSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      const [tableEl, namespace] = this.createMainElement('table', {
        class: 'column-layout-table'
      });
      this.applyCommonProperties(tableEl);

      const rowEl = this.createElement('tr');

      this.section.columns.forEach((col) => {
        const colEl = this.createElement('td');
        if (col.styles) Object.assign(colEl.style, col.styles);
        col.contents.forEach((section) => {

          const sectionEl = Heed.ContentSectionFactory.buildSection({
            section: section,
            slide: this.slide
          });

          this.applyCommonProperties.call({ section: col }, colEl);

          if (col.id) {
            this.slide.namespace[col.id] = colEl;
            colEl.id = col.id;
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
