import express from 'express';
import expressWs from 'express-ws';

import { registerRoutes } from './routes.js';
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
  const ws = expressWs(express());
  const app = ws.app;
  const router = express.Router();
  app.use(router);

  const { port, presentationRoot } = opts;

  registerRoutes(app, opts);
  registerWebsocket(app);

  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
    console.log(`Serving presentation from: ${presentationRoot}`);
    console.log('');
    console.log('Press Ctrl-C to exit.');
  });
};
