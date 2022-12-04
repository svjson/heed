(function() {

  class ContentSectionFactory {

    static buildSection(cfg) {
      let slide = cfg.slide,
          section = cfg.section;
      try {
        let sectionEl = document.createElement('div');
        sectionEl.setAttribute("class", "content-section");

        let sectionType = Heed.ContentSectionRegistry.resolve(section.type);
        if (!sectionType) throw "Unknown content section type: " + section.type;
        let contentSection = new sectionType(section, slide);

        let sectionNamespace = contentSection.renderTo(sectionEl);
        Object.assign(slide.namespace, sectionNamespace);
        contentSection.applyPosition();
        return sectionEl;
      } catch (e) {
        console.error("Could not render: ", section);
        throw e;
      }
    }

  }

  window.Heed.ContentSectionFactory = ContentSectionFactory;

})();
