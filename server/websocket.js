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
 * Inspect an incoming command from a client and produce an
 * event to propagate back to all connected clients if applicable.
 *
 * @param {Object} command - The command object received from the client.
 * @return {Object|null} - An event object to broadcast, or null if
 *                         no event should be sent.
 */
const handleCommand = (command) => {
  if (command.command === 'navigate') {
    return {
      event: 'navigation',
      source: {
        clientId: command.clientId,
      },
      payload: { slide: command.slide },
    };
  }

  return null;
};

/**
 * Handle an incoming message from a connected client, and
 * delegate to handleCommand to process the command.
 *
 * If the command produces an event, broadcast it to all
 * connected clients.
 *
 * @param server {WebSocketServer} - The WebSocket server instance.
 * @param message {string} - The incoming message from the client.
 * @param wsLog {Function} - The logging function for WebSocket events.
 */
const handleMessage = (server, message, _wsLog) => {
  try {
    const command = JSON.parse(message);

    const event = handleCommand(command);

    if (event) {
      server.clients.forEach((client) => {
        client.send(JSON.stringify(event));
      });
    }
  } catch (e) {
    console.error(`[ws] ERROR handling incoming message: ${e}`);
    console.error(`[ws] ${message}`);
  }
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

    ws.on('close', _ => {
      wsLog('Client disconnected');
      wsLog(`${server.clients.size} connected`);
    });

    ws.on('message', msg => handleMessage(server, msg, wsLog));
  });
};
