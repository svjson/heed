
import { Heed } from '../heed.js';
import { SlideTypeRegistry } from '../registry/SlideTypeRegistry.js';

export class DefaultSlideView {
  constructor(slide, step) {
    this.slide = slide;
    this.slideData = slide.data;
    this.currentStep = typeof step == 'number' ? step : slide.startStep;
  }

  hasMoreSteps() {
    return this.currentStep !== this.slide.endStep;;
  }

  hasPreviousSteps() {
    return this.currentStep > this.slide.startStep;
  }

  nextStep() {
    this.currentStep++;
    let step = this.slide.data.steps[this.currentStep];
    this.applyStep(step, 0);
  }

  prevStep() {
    let step = this.slide.data.steps[this.currentStep];
    this.applyStep(step, 1);
    this.currentStep--;
  }

  applyStep(step, dir) {
    if (step.transitions) {
      Object.keys(step.transitions).forEach((sectionId) => {
        let sectionTransition = step.transitions[sectionId],
          targetEl = this.slide.namespace[sectionId];
        if (!targetEl) {
          console.error(`Section '${sectionId}' not in namespace: `, this.slide.namespace);
          return;
        }
        Object.assign(targetEl.style, sectionTransition[dir]);
      });
    }
    if (step.innerText) {
      Object.keys(step.innerText).forEach((sectionId) => {
        let sectionText = step.innerText[sectionId],
          targetEl = this.slide.namespace[sectionId];
        targetEl.innerText = sectionText[dir];
      });
    }
  }

  show(el, defaults) {
    el.innerHTML = '';

    let config = JSON.parse(JSON.stringify(defaults)),
      appearance = Object.assign(
        config.appearance || {},
        this.slideData.appearance || {}
      ),
      style = '';

    if (appearance.backgroundImage) {
      if (appearance.backgroundMode === 'cover') {
        style += `background: url('${this.slide.path}${appearance.backgroundImage}') no-repeat center; `;
        style += 'background-size: cover; ';
      }
    } else if (appearance.background) style += `background: ${appearance.background}; `;
    if (appearance.padding) style += `padding: ${appearance.padding}; `;
    if (appearance.paddingTop) style += `padding-top: ${appearance.paddingTop}; `;
    if (appearance.color) style += `color: ${appearance.color}; `;
    if (appearance.fontSize) style += `font-size: ${appearance.fontSize}`;

    el.style = style;

    let slideEl = document.createElement('slide');

    if (this.slideData.class) {
      slideEl.setAttribute('class', this.slideData.class);
    }

    let h1 = document.createElement('h1');
    let title = this.slideData.title,
      titleStyles = {};

    if (typeof title === 'object') {
      titleStyles = title.styles;
      title = title.text;
    }

    Object.assign(h1.style, titleStyles);

    if (title == null || title == undefined) {

    } else if (!title) {
      h1.innerHTML = '&nbsp;';
    } else {
      h1.innerText = title;
    }
    if (h1.innerText) h1.classList.add('title');
    slideEl.appendChild(h1);


    if (this.slideData.contents) {
      this.slideData.contents.forEach((contentSection) => {
        let sectionEl = Heed.ContentSectionFactory.buildSection({
          section: contentSection,
          slide: this.slide
        });
        slideEl.appendChild(sectionEl);
      });
    }

    setTimeout(() => {
      this.slide.emit('afterrender');
    }, 5);

    el.appendChild(slideEl);

    if (this.currentStep > 0) {
      for (var i = 0; i <= this.currentStep; i++) {
        let step = this.slide.data.steps[i];
        this.applyStep(step, 0);
      }
    }
  }

  destroy() {
    let hooks = this.slide.getHooks('postDestroy');
    hooks.forEach((hook) => {
      hook.applyHook();
    });
  }

}

Heed.DefaultSlideView = DefaultSlideView;
SlideTypeRegistry.registerSlideType('default', DefaultSlideView);
