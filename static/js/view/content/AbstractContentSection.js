(function() {

  class AbstractContentSection {
    constructor(section, slide) {
      this.section = section;
      this.slide = slide;
    }

    applyCommonProperties(el) {
      if (this.section.width) {
        el.width = this.section.width;
      }
      if (this.section.height) {
        el.height = this.section.height;
      }
      if (this.section.visible === false) {
        el.style.visibility = 'hidden';
      }

      if (typeof this.section.styles === 'object') {
        Object.assign(el.style, this.section.styles);
      }
    }

    applyPosition() {
      if (!this.section.position) return;
      if (this.section.position.type === 'overlay') {
        let sectionEl = this.slide.namespace[this.section.id],
            targetEl = this.slide.namespace[this.section.position.target];
        if (this.section.visible === false) {
          sectionEl.style.display = 'none';
        }

        this.slide.onAfterRender(() => {
          let alignerFn = () => {
            let targetRect = targetEl.getBoundingClientRect();
            sectionEl.style.position = 'absolute';
            sectionEl.style.left = targetRect.left;
            sectionEl.style.top = targetRect.top;
            sectionEl.style.display = 'block';
          };
          let colLayoutEl = document.querySelector('.column-layout-table');
          if (colLayoutEl) {
            new ResizeObserver(alignerFn).observe(colLayoutEl);
          }
          alignerFn();
        });
      }
    }

  }


  Heed.AbstractContentSection = AbstractContentSection;

})();
