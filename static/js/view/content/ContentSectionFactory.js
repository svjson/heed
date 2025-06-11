(function() {

  class ContentSectionFactory {

    static buildSection(cfg) {
      const slide = cfg.slide,
          section = cfg.section;
      try {
        const sectionEl = document.createElement('div');
        sectionEl.setAttribute("class", "content-section");

        const sectionType = Heed.ContentSectionRegistry.resolve(section.type);
        if (!sectionType) throw "Unknown content section type: " + section.type;
        const contentSection = new sectionType(section, slide);

        const sectionNamespace = contentSection.renderTo(sectionEl);
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
