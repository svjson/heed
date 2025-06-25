
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
    this.navTree.on(
      'manual-navigation',
      (payload) => this.reportNavigation(payload)
    );

    this.notes = new NotesView({
      el: this.el.querySelector('#speaker-notes'),
      presentation: this.presentation
    });

    this.wsClient.on('navigation', event => {
      const slide = event?.payload?.slide;
      this.navTree.navigateTo(slide);
      this.notes.navigateTo(slide);
    });
  }

  replacePresentation(presentation) {
    this.notes.replacePresentation(presentation);
    this.navTree.replacePresentation(presentation);
  }

  /**
   * Report a locally initiated navigation to sub-components
   * and send a navigation command to the WebSocket server.
   *
   * @param {Object} payload - The navigation payload containing
   *                           the details of the navigation.
   */
  reportNavigation(payload) {
    const { slide } = payload;
    this.navTree.navigateTo(slide);
    this.notes.navigateTo(slide);
    this.wsClient.navigate(payload);
  }

  resize() {
    this.el.style.height = window.innerHeight;
    this.navTree.resize();
  }
}

