import { EventEmitter } from '../EventEmitter.js';
import { Heed, makeUri } from '../heed.js';

export class Slide extends EventEmitter {
  constructor(json) {
    super();
    this.json = json;
    this.name = json.name;
    this.id = json.id;
    this.hooks = {};
    this.namespace = {};
    this.startStep = json.startStep;
    this.endStep = json.endStep;
  }

  getType() {
    return this.data.type;
  }

  load(path, opts = {}) {
    this.path = path;
    this.staticPath = '/presentations/' + path;
    if (!this.id) {
      return this.produceFallbackSlide();
    }
    return new Promise(async (resolve) => {
      const slidePath = makeUri(this.path, this.id);
      const queryString = opts.notes ? '?notes=true' : '';
      const fileName = makeUri('/slide', slidePath) + queryString;

      const res = await fetch(fileName);
      if (res.status !== 200) {
        resolve(
          this.produceFallbackSlide({
            title: 'Slide missing!',
            content: `Could not load slide: '${slidePath}'`,
            error: true,
          }),
        );
        return;
      }

      try {
        const slideData = await res.json();
        this.data = slideData;
        if (opts.notes) {
          this.notes = slideData.notes;
        }
        this.configureHooks();
        this.configureSteps();
        resolve();
      } catch (e) {
        console.error(`Error parsing "${fileName}"`);
        let msg = e.toString();
        msg = msg.substring(msg.indexOf('position'));
        let errPos = parseInt(msg.split(' ')[1]);
        fetch(fileName).then(function (pres) {
          pres.text().then((text) => {
            let errMsg = text.substring(0, errPos);
            errMsg += '---->' + text.charAt(errPos) + '<----';
            errMsg += text.substring(errPos + 1);
            console.log(errMsg);
          });
        });
        console.error(msg);
      }
    });
  }

  getHooks(hookType) {
    let hooksOfType = this.hooks[hookType];
    if (!hooksOfType) return [];
    return hooksOfType;
  }

  configureHooks() {
    this.hooks = {};
    if (!this.data.hooks) return;
    Object.keys(this.data.hooks).forEach((hookType) => {
      let hooksOfType = [];
      Object.keys(this.data.hooks[hookType]).forEach((hookId) => {
        let hook = Heed.Hooks.createHook(
          hookId,
          this.data.hooks[hookType][hookId],
          this,
        );
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
      if (!this.endStep) this.endStep = this.data.steps.length - 1;
    }
  }

  produceFallbackSlide(opts = { title: 'No Title' }) {
    const { title, content } = opts;

    this.data = {
      type: 'default',
      title: this.name || title,
      contents: [],
    };

    if (content) {
      this.data.contents.push({
        type: 'html',
        html: content,
        styles: {
          fontSize: '40px',
        },
      });
    }

    Object.assign(this.data, this.json);

    return Promise.resolve();
  }

  onAfterRender(fn) {
    this.on('afterrender', fn);
  }
}

Heed.Slide = Slide;
