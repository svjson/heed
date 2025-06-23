import { THEMES } from './SpeakerView';

export class NavTreeView {
  constructor(opts) {
    this.wsClient = opts.wsClient;
    Object.assign(this, opts);
    this.renderModeToggleButton();
    this.slides = this.presentation.getOrderedSlides();
    this.renderTree();
    this.el.style.height = window.innerHeight;
    this.el.querySelectorAll('.slide').forEach((slideEl) => {
      slideEl.addEventListener('click', (e) => {
        this.slideClicked(e.currentTarget);
      });
    });
    this.el.querySelectorAll('.phase').forEach((phaseEl) => {
      phaseEl.addEventListener('click', (e) => {
        this.phaseClicked(e.currentTarget);
      });
    });
  }

  navigateTo(payload) {
    this.markCurrentSlide(payload.id, payload.index);
    this.markCurrentPhase(payload.id, payload.index, payload.step);
  }

  slideSelector(slideId, slideIndex) {
    return `.slide[data-slide-id="${slideId}"][data-slide-index="${slideIndex}"]`;
  }

  slideClicked(slideEl) {
    let slideId = slideEl.getAttribute('data-slide-id'),
      slideIndex = parseInt(slideEl.getAttribute('data-slide-index'));
    this.clearCurrentPhase();
    this.markCurrentSlide(slideId, slideIndex);
    this.wsClient.navigate({
      slide: {
        id: slideId,
        index: slideIndex,
        step: this.slides[slideIndex].startStep
      }
    });
  }

  markCurrent(el) {
    el.classList.add('current');
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }

  markCurrentSlide(slideId, slideIndex) {
    this.clearCurrentSlide();
    let slideEl = this.el.querySelector(this.slideSelector(slideId, slideIndex));
    this.markCurrent(slideEl);
  }

  clearCurrentSlide() {
    this.el.querySelectorAll('.slide').forEach((lmnt) => {
      lmnt.classList.remove('current');
    });
  }

  phaseClicked(phaseEl) {
    const slideId = phaseEl.getAttribute('data-slide-id');
    const slideIndex = parseInt(phaseEl.getAttribute('data-slide-index'));
    const phaseId = parseInt(phaseEl.getAttribute('data-step-index'));

    this.clearCurrentPhase();
    this.markCurrentSlide(slideId, slideIndex);
    this.markCurrentPhase(slideId, slideIndex, phaseId);
    this.wsClient.navigate({
      slide: {
        id: slideId,
        index: slideIndex,
        step: phaseId
      }
    });
  }

  markCurrentPhase(slideId, slideIndex, phaseId) {
    this.clearCurrentPhase();
    let phaseEl = this.el.querySelector(`.phase[data-step-index="${phaseId}"][data-slide-id="${slideId}"][data-slide-index="${slideIndex}"]`);

    if (phaseEl) {
      this.markCurrent(phaseEl);
    }
  }

  clearCurrentPhase() {
    this.el.querySelectorAll('.phase').forEach((lmnt) => {
      lmnt.classList.remove('current');
    });
  }

  renderModeToggleButton() {
    const savedTheme = localStorage.getItem('heed-speaker-notes-theme') ?? '';
    const currentTheme = THEMES[savedTheme];

    if (savedTheme === 'theme-dark') document.body.classList.add('theme-dark');
    const button = document.createElement('div');
    button.classList.add('mode-toggle-button');
    button.setAttribute('data-theme', currentTheme.className);
    button.innerText = currentTheme.name;
    button.addEventListener('click', () => {
      const newTheme = button.getAttribute('data-theme') === 'theme-dark' ? '' : 'theme-dark';
      const { name, className } = THEMES[newTheme];

      document.body.classList.toggle('theme-dark', className === 'theme-dark');
      button.innerText = name;
      button.setAttribute('data-theme', newTheme);
      localStorage.setItem('heed-speaker-notes-theme', newTheme);
    });
    this.el.appendChild(button);
  }

  renderTree() {
    this.renderSection(this.presentation, 0);
  }

  renderSection(section, level) {
    let sectionEl = document.createElement('div');
    sectionEl.classList.add('section');
    sectionEl.innerText = section.name || section.id;
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
    //    slideEl.style.marginLeft = (level-1)*16;
    slideEl.setAttribute('data-slide-id', slide.id);
    slideEl.setAttribute('data-slide-index', slideIndex);
    slideEl.setAttribute('data-start-step', slide.startStep);
    this.el.appendChild(slideEl);

    if (Array.isArray(slide.data.steps)) {
      for (var i = slide.startStep; i<= slide.endStep; i++) {
        this.renderPhase(slide, slide.data.steps[i], i, level+1);
      }
    }
  }

  renderPhase(slide, step, stepIndex, depth) {
    let phaseEl = document.createElement('div'),
      slideIndex = this.slides.indexOf(slide);

    phaseEl.classList.add('phase');
    phaseEl.innerText = '- ' + step.id;
    phaseEl.setAttribute('data-slide-id', slide.id);
    phaseEl.setAttribute('data-slide-index', slideIndex);
    phaseEl.setAttribute('data-step-index', stepIndex);
    phaseEl.setAttribute('data-depth', depth);
    this.el.appendChild(phaseEl);
  }

  resize() {
    this.el.style.height = window.innerHeight;
  }

}
