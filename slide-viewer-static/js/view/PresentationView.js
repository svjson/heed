import { Heed } from '../heed.js';
import { DefaultSlideView } from './DefaultSlideView.js';

export class PresentationView {
  constructor(config) {
    this.presentation = config.presentation;
    this.slides = this.presentation.getOrderedSlides();
    this.el = document.querySelector('#slide-container');
    this.navigator = config.navigator;

    let parts = document.location.href.split('#'),
      slideIndex = parts[1] ? parseInt(parts[1]) : 0;
    this.showSlide(slideIndex);

    if (this.presentation.css) {
      Heed.loadStylesheet(this.presentation.css);
    }

    document.addEventListener('keydown', e => {
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

    this.navigator.on('navigation', (payload) => {
      this.showSlide(payload.index, payload.step);
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

  showSlide(slideIndex, step) {
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
      slideView = new DefaultSlideView(this.currentSlide, step);
      break;
    }
    if (this.slideView) {
      this.slideView.destroy();
    }
    this.slideView = slideView;

    this.reportNavigation();

    let preHooks = [];
    this.currentSlide.getHooks('preRender').forEach((hook) => {
      preHooks.push(hook.applyHook());
    });
    Promise.all(preHooks).then(() => {
      this.slideView.show(this.el, this.presentation.getDefaults());
      this.currentSlide.getHooks('postRender').forEach((hook) => {
        hook.applyHook();
      });
    });
  }

  reportNavigation() {
    this.navigator.navigate({
      slide: {
        id: this.currentSlide.id,
        index: this.slideIndex,
        step: this.slideView.currentStep
      }
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
