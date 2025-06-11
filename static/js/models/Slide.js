(function() {

  class Slide {
    constructor(json) {
      this.json = json;
      this.name = json.name;
      this.id = json.id;
      this.hooks = {};
      this.namespace = {};
      this.events = {
        'afterrender': []
      };

      this.startStep = json.startStep;
      this.endStep = json.endStep;
    }

    getType() {
      return this.data.type;
    }

    load(path, opts) {
      if (!opts) opts = {};
      this.path = path;
      this.staticPath = '/presentations/' + path;
      if (!this.id) {
        return this.createDefault();
      }
      return new Promise((resolve, reject) => {
        let fileName = '/slide/' + this.path + this.id;
        fetch(fileName).then((res) => {
          if (res.status !== 200) {
            throw new Error(`Could not load slide: '${this.path + this.id}`)
          }
          res.json().then((slideData) => {
            this.data = slideData;
            this.configureHooks();
            this.configureSteps();
            if (opts.notes && slideData.notes) {
              fetch(this.staticPath + slideData.notes).then((res) => {
                res.text().then((notesText) => {
                  this.notes = notesText;
                  resolve();
                });
              });
            } else {
              resolve();
            }
          }).catch((e) => {
            console.error(`Error parsing "${fileName}"`);
            let msg = e.toString();
            msg = msg.substring(msg.indexOf('position'));
            let errPos = parseInt(msg.split(' ')[1]);
            fetch(fileName).then(function(pres) {
              pres.text().then((text) => {
                let errMsg = text.substring(0, errPos);
                errMsg += '---->' + text.charAt(errPos) + '<----';
                errMsg += text.substring(errPos+1);
                console.log(errMsg);
              });
            });
            console.error(msg);
          });
        });
      });
    }

    getHooks(hookType) {
      let hooksOfType =  this.hooks[hookType];
      if (!hooksOfType) return [];
      return hooksOfType;
    }

    configureHooks() {
      this.hooks = {};
      if (!this.data.hooks) return;
      Object.keys(this.data.hooks).forEach((hookType) => {
        let hooksOfType = [];
        Object.keys(this.data.hooks[hookType]).forEach((hookId) => {
          let hook = Heed.Hooks.createHook(hookId, this.data.hooks[hookType][hookId], this);
          hooksOfType.push(hook);
        });
        this.hooks[hookType] = hooksOfType;
      });
    }

    configureSteps() {
      if (!Array.isArray(this.data.steps)) {
        this.startStep = 0;
        this.endStep = 0;
      } else {
        if (!this.startStep) this.startStep = 0;
        if (!this.endStep) this.endStep = this.data.steps.length-1;
      }
    }

    createDefault() {
      this.data = {
        type: 'default',
        title: this.name || 'No Title'
      };

      Object.assign(this.data, this.json);

      return Promise.resolve();
    }

    onAfterRender(fn) {
      this.events.afterrender.push(fn);
    }

    fire(event) {
      this.events[event].forEach((fn) => {
        fn();
      });
    }
  }

  window.Heed.Slide = Slide;

})();
