import { Heed, hashIndex } from '../heed.js';
import { DefaultSlideView } from './DefaultSlideView.js';

export class PresentationView {
  constructor(config) {
    this.presentation = config.presentation;
    this.slides = this.presentation.getOrderedSlides();
    this.el = document.querySelector('#slide-container');
    this.wsClient = config.wsClient;

    const slideIndex = hashIndex();
    this.showSlide(slideIndex);

    if (this.presentation.css) {
      Heed.loadStylesheet(this.presentation.css);
    }

    document.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowRight') {
        if (e.ctrlKey) {
          this.nextSlide();
        } else {
          this.forward();
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.ctrlKey) {
          this.prevSlide();
        } else {
          this.back();
        }
      }
    });

    this.wsClient.on('navigation', (event) => {
      const slide = event?.payload?.slide;
      if (slide) {
        this.showSlide(slide.index, slide.step, { silent: true });
      }
    });
  }

  replacePresentation(presentation) {
    this.presentation = presentation;
    this.slides = this.presentation.getOrderedSlides();

    // FIXME: Load/reload stylesheets if applicable

    // FIXME: Find current slide by id/name/etc, not index
    // Slides may have been added/deleted
    const currentPhase = this.slideView?.currentStep ?? 0;
    this.showSlide(this.slideIndex, currentPhase);
  }

  /**
   * Navigate to a specific slide and phase.
   *
   * To cancel reporting/propagation of this navigation, the
   * `silent`-option can be provided. This is relevant when the
   * navigation is done as reaction to a navigation event and we
   * don't want to produce another navigation event.
   *
   * @param {number} slideIndex - The index of the slide to show.
   * @param {number} phase - The phase within the slide to show.
   * @param {Object} options - Optional parameters.
   * @param {boolean} options.silent - If true, suppresses navigation reporting.
   */
  showSlide(slideIndex, phase, { silent } = { silent: false }) {
    slideIndex =
      slideIndex >= this.slides.length ? this.slides.length - 1 : slideIndex;
    const slideChanged = slideIndex !== this.slideIndex;
    this.slideIndex = slideIndex;
    this.currentSlide = this.slides[slideIndex];
    if (slideChanged) {
      history.pushState({}, null, '#' + slideIndex);
    }

    let slideView = null;

    switch (this.currentSlide.getType()) {
    case 'default':
    default:
      slideView = new DefaultSlideView(this.currentSlide, phase);
      break;
    }
    if (this.slideView) {
      this.slideView.destroy();
    }
    this.slideView = slideView;

    if (!silent) {
      this.reportNavigation();
    }

    const preHooks = [];
    this.currentSlide.getHooks('preRender').forEach((hook) => {
      preHooks.push(hook.applyHook());
    });
    Promise.all(preHooks).then(() => {
      this.slideView.show(this.el, this.presentation.getDefaults());
      this.currentSlide.getHooks('postRender').forEach((hook) => {
        queueMicrotask(() => hook.applyHook());
      });
    });
  }

  reportNavigation() {
    this.wsClient.navigate({
      slide: {
        id: this.currentSlide.id,
        index: this.slideIndex,
        step: this.slideView.currentStep,
      },
    });
  }

  forward() {
    if (this.slideView.hasMoreSteps()) {
      this.slideView.nextStep();
      this.reportNavigation();
    } else {
      this.nextSlide();
    }
  }

  nextSlide() {
    if (this.slideIndex + 1 < this.slides.length) {
      this.showSlide(this.slideIndex + 1);
    }
  }

  back() {
    if (this.slideView.hasPreviousSteps()) {
      this.slideView.prevStep();
      this.reportNavigation();
    } else {
      this.prevSlide();
    }
  }

  prevSlide() {
    if (this.slideIndex > 0) {
      this.showSlide(this.slideIndex - 1);
    }
  }
}

Heed.PresentationView = PresentationView;
