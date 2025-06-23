import { Heed } from '../heed.js';
import { Slide } from './Slide.js';

export class Section {
  constructor(json) {
    this.json = json;
    this.name = json.name;
    this.id = json.id;
    this.slides = [],
    this.sections = [];

    if (this.json.slide) {
      this.slides.push(new Slide(this.json.slide));
    }

    if (json.slides) {
      this.type = 'slide-container';
      json.slides.forEach((slide) => {
        this.slides.push(new Slide(slide));
      });
    }

    if (json.sections) {
      this.type = 'section-container';
      json.sections.forEach((section) => {
        this.sections.push(new Section(section));
      });
    }
  }

  getOrderedSlides() {
    let slides = [];

    this.slides.forEach((slide) => {
      slides = slides.concat(slide);
    });
    this.sections.forEach((section) => {
      slides = slides.concat(section.getOrderedSlides());
    });
    return slides;
  }

  load(path, opts) {
    if (!opts) opts = {};
    var promises = [];
    this.slides.forEach((slide) => {
      promises.push(slide.load(path + this.id + '/slides/', opts));
    });
    this.sections.forEach((section) => {
      promises.push(section.load(path + this.id + '/sections/', opts));
    });
    return Promise.all(promises);
  }
}

Heed.Section = Section;

