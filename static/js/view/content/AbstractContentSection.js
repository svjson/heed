(function() {

  class AbstractContentSection {
    constructor(section, slide) {
      this.section = section;
      this.slide = slide;
    }

    createMainElement(lmntName, props = {}) {
      const el = this.createElement(lmntName, Object.assign({ id: this.section.id }, props))
      const namespace = {};
      if (this.section.id) {
        namespace[this.section.id] = el;
      }
      return [el, namespace];
    }

    createElement(lmntName, props = {}) {
      const el = document.createElement(lmntName);
      Object.entries(props).forEach(([key, val]) => el.setAttribute(key, val));
      return el;
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

      if (this.section.class) {
        el.setAttribute('class', this.section.class);
      }

      if (typeof this.section.styles === 'object') {
        Object.assign(el.style, this.section.styles);
      }
    }

    applyPosition() {
      if (!this.section.position) return;
      if (this.section.position.type === 'overlay') {
        const sectionEl = this.slide.namespace[this.section.id],
              targetEl = this.slide.namespace[this.section.position.target];
        if (this.section.visible === false) {
          sectionEl.style.display = 'none';
        }

        this.slide.onAfterRender(() => {
          const alignerFn = () => {
            const targetRect = targetEl.getBoundingClientRect();
            sectionEl.style.position = 'absolute';
            sectionEl.style.left = targetRect.left;
            sectionEl.style.top = targetRect.top;
            sectionEl.style.display = 'block';
          };
          const colLayoutEl = document.querySelector('.column-layout-table');
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
