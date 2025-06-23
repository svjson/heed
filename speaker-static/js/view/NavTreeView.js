export class NavTreeView {
  constructor(opts) {
    Object.assign(this, opts);
    this.slides = this.presentation.getOrderedSlides();
    this.renderTree();
    this.el.style.height = window.innerHeight;
    this.el.querySelectorAll('.slide').forEach((slideEl) => {
      slideEl.addEventListener('click', (e) => {
        this.slideClicked(e.currentTarget);
      });
    });
    this.el.querySelectorAll('.step').forEach((stepEl) => {
      stepEl.addEventListener('click', (e) => {
        this.stepClicked(e.currentTarget);
      });
    });
  }

  navigateTo(payload) {
    this.markCurrentSlide(payload.id, payload.index);
    this.markCurrentStep(payload.id, payload.index, payload.step);
  }

  slideSelector(slideId, slideIndex) {
    return `.slide[data-slide-id="${slideId}"][data-slide-index="${slideIndex}"]`;
  }

  slideClicked(slideEl) {
    let slideId = slideEl.getAttribute('data-slide-id'),
      slideIndex = parseInt(slideEl.getAttribute('data-slide-index'));
    this.clearCurrentStep();
    this.markCurrentSlide(slideId, slideIndex);
    this.navigator.navigate({
      slide: {
        id: slideId,
        index: slideIndex,
        step: this.slides[slideIndex].startStep
      }
    });

  }

  markCurrentSlide(slideId, slideIndex) {
    this.clearCurrentSlide();
    let slideEl = this.el.querySelector(this.slideSelector(slideId, slideIndex));
    slideEl.classList.add('current');
    slideEl.scrollIntoViewIfNeeded();
  }

  clearCurrentSlide() {
    this.el.querySelectorAll('.slide').forEach((lmnt) => {
      lmnt.classList.remove('current');
    });
  }

  stepClicked(stepEl) {
    let slideId = stepEl.getAttribute('data-slide-id'),
      slideIndex = parseInt(stepEl.getAttribute('data-slide-index')),
      stepId = parseInt(stepEl.getAttribute('data-step-index'));

    this.clearCurrentStep();
    this.markCurrentSlide(slideId, slideIndex);
    this.markCurrentStep(slideId, slideIndex, stepId);
    this.navigator.navigate({
      slide: {
        id: slideId,
        index: slideIndex,
        step: stepId
      }
    });
  }

  markCurrentStep(slideId, slideIndex, stepId) {
    this.clearCurrentStep();
    let stepEl = this.el.querySelector(`.step[data-step-index="${stepId}"][data-slide-id="${slideId}"][data-slide-index="${slideIndex}"]`);

    if (stepEl) {
      stepEl.classList.add('current');
      stepEl.scrollIntoViewIfNeeded();
    }
  }

  clearCurrentStep() {
    this.el.querySelectorAll('.step').forEach((lmnt) => {
      lmnt.classList.remove('current');
    });
  }

  renderTree() {
    this.renderSection(this.presentation, 0);
  }

  renderSection(section, level) {
    let sectionEl = document.createElement('div');
    sectionEl.classList.add('section');
    sectionEl.innerText = section.name || section.id;
    sectionEl.style.marginLeft = level*16;
    this.el.appendChild(sectionEl);
    section.slides.forEach((slide) => {
      this.renderSlide(slide, level+1);
    });
    section.sections.forEach((subSection) => {
      this.renderSection(subSection, level+1);
    });
  }

  renderSlide(slide, level) {
    let slideEl = document.createElement('div'),
      slideIndex = this.slides.indexOf(slide);

    slideEl.classList.add('slide');
    slideEl.innerText = slide.name || slide.id;
    slideEl.style.marginLeft = level*16;
    slideEl.setAttribute('data-slide-id', slide.id);
    slideEl.setAttribute('data-slide-index', slideIndex);
    slideEl.setAttribute('data-start-step', slide.startStep);
    this.el.appendChild(slideEl);

    if (Array.isArray(slide.data.steps)) {
      for (var i = slide.startStep; i<= slide.endStep; i++) {
        this.renderStep(slide, slide.data.steps[i], i, level+1);
      }
    }
  }

  renderStep(slide, step, stepIndex, level) {
    let stepEl = document.createElement('div'),
      slideIndex = this.slides.indexOf(slide);

    stepEl.classList.add('step');
    stepEl.innerText = '- ' + step.id;
    stepEl.style.marginLeft = level*16;
    stepEl.setAttribute('data-slide-id', slide.id);
    stepEl.setAttribute('data-slide-index', slideIndex);
    stepEl.setAttribute('data-step-index', stepIndex);
    this.el.appendChild(stepEl);
  }

  resize() {
    this.el.style.height = window.innerHeight;
  }

}
