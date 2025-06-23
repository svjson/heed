
import { NavTreeView } from './NavTreeView.js';
import { NotesView } from './NotesView.js';

export class SpeakerView {
  constructor(opts) {
    Object.assign(this, opts);
    this.navTree = new NavTreeView({
      el: this.el.querySelector('#nav-tree'),
      presentation: this.presentation,
      navigator: this.navigator
    });

    this.notes = new NotesView({
      el: this.el.querySelector('#speaker-notes'),
      presentation: this.presentation
    });

    this.navigator.on('navigation', (payload) => {
      this.navTree.navigateTo(payload);
      this.notes.navigateTo(payload);
    });
  }

  resize() {
    this.el.style.height = window.innerHeight;
    this.navTree.resize();
  }
}

