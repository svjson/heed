(function() {

  var sectionTypes = {};

  class ContentSectionRegistry {

    static register(typeId, sectionClass) {
      sectionTypes[typeId] = sectionClass;
    }

    static resolve(typeId) {
      if (!sectionTypes[typeId]) {
        console.warn('No content type registered: ' + typeId);
        console.warn('Available types', Object.keys(sectionTypes));
      }
      return sectionTypes[typeId];
    }

  }

  window.Heed.ContentSectionRegistry = ContentSectionRegistry;

})();
