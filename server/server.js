import express from 'express';
import expressWs from 'express-ws';

import { registerRoutes } from './routes.js';
import { initWatcher } from './watch.js';
import { registerWebsocket } from './websocket.js';

/**
 * Starts the Heed server with the provided options.
 *
 * Options:
 * - `port`: The port on which the server will listen.
 * - `presentationRoot`: The root directory of the presentation to serve.
 * - `heedRoot`: The root directory of the Heed package.
 *
 * @param {Object} opts - Options for the server.
 */
export const startServer = (opts) => {
  const { app, getWss } = expressWs(express());

  const {
    archiveFile,
    heedRoot,
    port,
    presentationRoot,
    presentationName,
    showWatches,
    silentWs,
    watch
  } = opts;
  registerWebsocket(app, getWss, silentWs);
  registerRoutes(app, opts);

  let watches = [];
  if (watch) {
    watches = initWatcher({
      getWss,
      heedRoot,
      isArchive: Boolean(archiveFile),
      presentationName,
      presentationRoot
    });
  }

  app.listen(port, () => {
    if (process.send) {
      process.send({ type: 'ready' });
    }
    console.log(`Listening on port ${port}`);
    console.log(`Serving presentation '${presentationName}'`);
    if (archiveFile) {
      console.log(`From archive '${archiveFile}'`);
      console.log(`Cache dir: '${presentationRoot}'`);
    } else {
      console.log(`From directory: ${presentationRoot}`);
    }
    if (showWatches && watches.length) {
      console.log(`Watching for changes in: ${watches.join(', ')}`);
    }
    console.log('');
    console.log('Press Ctrl-C to exit.');
  });
};
