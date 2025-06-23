
import { Heed } from '../heed.js';

export class SlideTypeRegistry {

  static slideTypes = {};

  static registerSlideType(typeId, slideClass) {
    this.slideTypes[typeId] = slideClass;
  }

  static resolveSlideType(typeId) {
    let slideType = this.slideTypes[typeId];
    if (!slideType) return this.slideTypes['default'];
    return slideType;
  }
}

Heed.SlideTypeRegistry = SlideTypeRegistry;

