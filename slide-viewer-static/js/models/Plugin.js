(function() {

  class Plugin {

    constructor(pluginId, config) {
      this.pluginId = pluginId;
      this.config = config;
    }

    load() {
      return new Promise((resolve) => {
        fetch(`/plugins/${this.pluginId}/plugin.json`).then((resp) => {
          resp.json().then((pluginJson) => {
            pluginJson.requires.js = pluginJson.requires.js || [];
            pluginJson.requires.css = pluginJson.requires.css || [];
            pluginJson.requires.pluginCss = pluginJson.requires.pluginCss || [];
            pluginJson.provides = pluginJson.provides || {};
            this.json = pluginJson;
            this.pluginBase = pluginJson.pluginBase;
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
