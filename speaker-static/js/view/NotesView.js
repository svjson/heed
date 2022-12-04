(function() {

  class NotesView {
    constructor(opts) {
      Object.assign(this, opts);
      this.slides = this.presentation.getOrderedSlides();
      this.renderNotes();
    }

    renderNotes() {
      this.slides.forEach((slide, index) => {
        let slideEl = document.createElement('div'),
            slideTitle = document.createElement('h3'),
            preEl = document.createElement('pre');

        slideEl.setAttribute('data-slide-index', index);

        slideTitle.innerText = slide.name || slide.id;

        if (slide.notes) {
          preEl.innerHTML = slide.notes;;
        }

        slideEl.appendChild(slideTitle);
        slideEl.appendChild(preEl);
        this.el.appendChild(slideEl);
      });
    }

    navigateTo(payload) {
      let slideEl = this.el.querySelector(`[data-slide-index="${payload.index}"]`);
      if (slideEl) slideEl.scrollIntoViewIfNeeded();
    }
  }

  Speaker.NotesView = NotesView;

})();
