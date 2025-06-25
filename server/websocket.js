
/**
 * Make a logging function for WebSocket state changes,
 * which is no op for `silent=true`
 *
 * @param {boolean} silent - If true, no logging will be done.
 * @return {Function} - A logging function that logs messages to the
 *                      console (or not).
 */
const makeWebSocketLogger = (silent) => {
  return silent
    ? () => {}
    : (message) => {
      console.log(`[ws] ${message}`);
    };
};

/**
 * Register the websocket server and endpoints used to keep
 * the Speaker-application in sync with the presentation.
 *
 * @param {Object} app - The Express application instance.
 * @param {Function} getWss - Function to get the WebSocket server instance.
 */
export const registerWebsocket = (app, getWss, silentLog) => {

  const server = getWss();
  const wsLog = makeWebSocketLogger(silentLog);

  app.ws('/', (ws, _req) => {
    wsLog('Client connected');
    wsLog(`${server.clients.size} connected`);

    ws.on('open', req => {
      console.log(req);
      wsLog('Connect', req);
    });

    ws.on('close', _ => {
      wsLog('Client disconnect');
      wsLog(`${server.clients.size} connected`);
    });

    ws.on('message', msg => {
      server.clients.forEach((client) => {
        client.send(msg);
      });
    });

  });
};
