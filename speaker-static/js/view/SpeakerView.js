
import { NavTreeView } from './NavTreeView.js';
import { NotesView } from './NotesView.js';

export const THEMES = {
  '': {
    name: 'Light Mode',
    className: ''
  },
  'theme-dark': {
    name: 'Dark Mode',
    className: 'theme-dark'
  }
};

export class SpeakerView {
  constructor(opts) {
    Object.assign(this, opts);
    this.navTree = new NavTreeView({
      el: this.el.querySelector('#nav-tree'),
      presentation: this.presentation,
      wsClient: this.wsClient
    });

    this.notes = new NotesView({
      el: this.el.querySelector('#speaker-notes'),
      presentation: this.presentation
    });

    this.wsClient.on('navigation', (payload) => {
      this.navTree.navigateTo(payload);
      this.notes.navigateTo(payload);
    });
  }

  replacePresentation(presentation) {
    this.notes.replacePresentation(presentation);
    this.navTree.replacePresentation(presentation);
  }

  resize() {
    this.el.style.height = window.innerHeight;
    this.navTree.resize();
  }
}

