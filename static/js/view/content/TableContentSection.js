(function() {

  class TableContentSection extends Heed.AbstractContentSection {
    constructor(section, slide) {
      super(section, slide);
    }

    renderTo(el) {
      let tableEl = document.createElement('table'),
          namespace = {};

      namespace[this.section.id] = tableEl;

      this.applyCommonProperties(tableEl);
      if (this.section.border && this.section.border.type === 'inner') {
        tableEl.classList.add('table-inner-border');
      }

      let cellStyles = this.section.cellStyles || {};

      this.section.rows.forEach((row, rowIndex) => {
        let rowEl = document.createElement('tr'),
            rowData = row;

        if (this.section.rowStyles) {
          Object.assign(rowEl.style, this.section.rowStyles);
        }
        if (Array.isArray(this.section.rowIndexStyles)) {
          let rowIndexStyle = this.section.rowIndexStyles[rowIndex];
          if (rowIndexStyle) {
            Object.assign(rowEl.style, rowIndexStyle);
          }
        }

        if (row.id) {
          namespace[row.id] = rowEl;
        }

        if (!Array.isArray(row)) {
          rowData = row.data;
        }

        rowData.forEach((cell, index) => {
          let cellEl = document.createElement('td');
          Object.assign(cellEl.style, cellStyles);
          if (Array.isArray(this.section.cellIndexStyles)) {
            let cellIndexStyle = this.section.cellIndexStyles[index];
            if (cellIndexStyle) {
              Object.assign(cellEl.style, cellIndexStyle);
            }
          }

          let cellValue = cell;
          if (typeof cell === 'object') {
            cellValue = cell.value;
            namespace[cell.id] = cellEl;
          }

          if (this.section.htmlCells) {
            cellEl.innerHTML = cellValue;
          } else {
            cellEl.innerText = cellValue;
          }

          if (typeof this.section.cellDimensions === 'object') {
            cellEl.style.width = this.section.cellDimensions.width;
            cellEl.style.height = this.section.cellDimensions.height;
          }

          rowEl.appendChild(cellEl);
        });

        tableEl.appendChild(rowEl);
      });

      el.appendChild(tableEl);
      return namespace;
    }

  }

  Heed.ContentSectionRegistry.register('table', TableContentSection);

})();
