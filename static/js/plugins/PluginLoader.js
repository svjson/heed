(function() {

  class PluginLoader {

    static loadPlugin(pluginSpec) {
      return new Promise((resolve, reject) => {
        let pluginBase = pluginSpec.json.pluginBase,
            pluginDir = '/plugins/' + pluginSpec.pluginId;
        if (pluginBase) pluginBase = pluginBase.substring(0, pluginBase.length-1);
        window[`${pluginSpec.pluginId}Base`] = pluginBase;

        var promises = [];

        let jsPromises = [];
        pluginSpec.json.requires.js.forEach(async (scr) => {
          jsPromises.push(Heed.loadResource(pluginBase + '/' + scr));
        });

        pluginSpec.json.requires.css.forEach((css) => {
          Heed.loadStylesheet(pluginBase + '/' + css);
        });

        pluginSpec.json.requires.pluginCss.forEach((css) => {
          Heed.loadStylesheet(pluginDir + '/' + css);
        });

        Object.keys(pluginSpec.json.provides).forEach((objectType) => {
          Object.keys(pluginSpec.json.provides[objectType]).forEach((compId) => {
            var p = Heed.loadScript('/plugins/' + pluginSpec.pluginId + '/' + pluginSpec.json.provides[objectType][compId].src);
            promises.push(p);
          });
        });

        Promise.all(jsPromises).then(scripts => {
          Heed.appendScript(scripts.join('\n\n'));

          Promise.all(promises).then(() => {
            resolve();
          });
        });

      });
    }
  }

  window.Heed.PluginLoader = PluginLoader;

})();
