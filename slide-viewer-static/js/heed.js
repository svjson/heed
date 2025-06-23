export const Heed = {

  plugins: {},
  _loadedScripts: [],
  _loadedStylesheets: [],

  loadStylesheet: function(url) {
    return this._loadedStylesheets.includes(url)
      ? Promise.resolve()
      : new Promise((resolve) => {
        const tag = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.href = url;
        tag.onload = function() {
          resolve();
        };
        document.querySelector('head').appendChild(tag);
        this._loadedStylesheets.push(url);
      });
  },

  loadScript: function(url) {
    return this._loadedScripts.includes(url)
      ? Promise.resolve()
      : new Promise((resolve) => {
        const tag = document.createElement('script');
        tag.type = 'text/javascript';
        tag.src = url;
        tag.onload = function() {
          resolve();
        };
        document.body.appendChild(tag);
        this._loadedScripts.push(url);
      });
  },

  appendScript: function(script) {
    const tag = document.createElement('script');
    tag.type = 'text/javascript';
    tag.innerHTML = script;
    document.body.appendChild(tag);
  },

  loadResource: async (url) => {
    const resource = await fetch(url);
    return await resource.text();
  }
};

/**
 * Ubiquitous pseudo-GUID pinched from these here Internets.
 * Its origin is uncertain, but definitely popularized via StackOverflow and gists
 * by Brian Donovan(Broofa).
 */
export const guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

window.Heed = Heed;
