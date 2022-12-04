window.Speaker = {

};

document.addEventListener('DOMContentLoaded', function() {
  Heed.Presentation.load({ notes: true }).then((instance) => {
    let navigator = new Heed.WebSocketNavigator({ actor: 'speaker' });
    navigator.connect().then(() => {
      let speakerView = new Speaker.SpeakerView({
        el: document.querySelector('#speaker-container'),
        presentation: instance,
        navigator: navigator
      });

      window.addEventListener('resize', () => {
        speakerView.resize();
      });
    });
  });
});
