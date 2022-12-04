(function() {

  var slideTypes = {};

  class SlideTypeRegistry {

    static registerSlideType(typeId, slideClass) {
      slideTypes[typeId] = slideClass;
    }

    static resolveSlideType(typeId) {
      let slideType = slideTypes[typeId];
      if (!slideType) return slideTypes['default'];
      return slideType;
    }
  }

  window.Heed.SlideTypeRegistry = SlideTypeRegistry;

})();
