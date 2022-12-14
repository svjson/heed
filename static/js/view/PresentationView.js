(function() {

  class PresentationView {
    constructor(config) {
      this.presentation = config.presentation;
      this.slides = this.presentation.getOrderedSlides();
      this.el = document.querySelector('#slide-container');
      this.navigator = config.navigator;

      let parts = document.location.href.split('#'),
          slideIndex = parts[1] ? parseInt(parts[1]) : 0;
      this.showSlide(slideIndex);

      document.addEventListener('keydown', e => {
        if (e.keyCode === 39) {
          this.forward();
        } else if (e.keyCode === 37) {
          this.back();
        }
      });

      this.navigator.on('navigation', (payload) => {
        this.showSlide(payload.index, payload.step);
      });
    }

    showSlide(slideIndex, step) {
      this.slideIndex = slideIndex;
      this.currentSlide = this.slides[slideIndex];
      history.pushState({}, null, '#' + slideIndex);

      let slideView = null;

      switch (this.currentSlide.getType()) {
      case 'default':
      default:
        slideView = new Heed.DefaultSlideView(this.currentSlide, step);
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
      if (this.slideIndex+1 < this.slides.length) {
        this.showSlide(this.slideIndex+1);
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
        this.showSlide(this.slideIndex-1);
      }
    }

  }

  Heed.PresentationView = PresentationView;

})();
