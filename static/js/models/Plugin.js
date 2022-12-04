(function() {

  class Plugin {

    constructor(pluginId, config) {
      this.pluginId = pluginId;
      this.config = config;
    }

    load() {
      return new Promise((resolve, reject) => {
        fetch(`/plugins/${this.pluginId}/${this.pluginId}.json`).then((resp) => {
          resp.json().then((pluginJson) => {
            this.json = pluginJson;
            this.initializePlugin().then(() => {
              resolve();
            });
          });
        });
      });
    }

    initializePlugin() {
      return Heed.PluginLoader.loadPlugin(this);
    }

  }

  window.Heed.Plugin = Plugin;

})();
