(function() {

  class Presentation {
    constructor(json) {
      this.json = json;
      this.css = json.css;
      this.name = json.name;
      this.slides = [];
      this.sections = [];
      this.plugins = [];
      if (this.json.slide) {
        this.slides.push(new Heed.Slide(this.json.slide));
      }
      this.json.slides?.forEach(slide => {
        this.slides.push(new Heed.Slide(slide));
      });
      if (this.json.sections) {
        this.json.sections.forEach((section) => {
          let _section = new Heed.Section(section);
          this.sections.push(_section);
        });
      }
      if (this.json.plugins) {
        Object.keys(this.json.plugins).forEach((pluginId) => {
          this.plugins.push(new Heed.Plugin(pluginId, this.json.plugins[pluginId]));
        });
      }
    }

    getPluginConfig(pluginId) {
      return this.json.plugins?.[pluginId];
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

    getDefaults() {
      return this.json.defaults || {};
    }

    load(opts) {
      if (!opts) opts = {};
      let promises = this.sections.map((sect) => sect.load('sections/', opts));
      promises = promises.concat(this.slides.map((slide) => slide.load('slides/', opts)));
      promises = promises.concat(this.plugins.map((plugin) => plugin.load()));
      return Promise.all(promises);
    }

    static load(opts) {
      if (!opts) opts = {};
      return new Promise((resolve, reject) => {
        fetch('/presentation/presentation.json').then(function(pres) {
          pres.json().then((presentation) => {
            let instance = new Heed.Presentation(presentation);
            instance.load(opts).then(() => {
              resolve(instance);
            });
          }).catch((e) => {
            console.error('Error parsing "presentation.json"');
            let msg = e.toString();
            msg = msg.substring(msg.indexOf('position'));
            let errPos = parseInt(msg.split(' ')[1]);
            fetch('/presentation/presentation.json').then(function(pres) {
              pres.text().then((text) => {
                let errMsg = text.substring(0, errPos);
                errMsg += '---->' + text.charAt(errPos) + '<----';
                errMsg += text.substring(errPos+1);
                console.log(errMsg);
              });
            });
            console.error(msg);
            reject();
          });;
        });
      });
    }
  }

  window.Heed.Presentation = Presentation;

})();
