(function() {

  class SpeakerView {
    constructor(opts) {
      Object.assign(this, opts);
      this.navTree = new Speaker.NavTreeView({
        el: this.el.querySelector('#nav-tree'),
        presentation: this.presentation,
        navigator: this.navigator
      });

      this.notes = new Speaker.NotesView({
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

  Speaker.SpeakerView = SpeakerView;

})();
