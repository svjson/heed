/**
 * Register up the websocket server and endpoints used
 * to keep the Speaker-application in sync with the presentation.
 *
 * Not touched since the before-times.
 */
export const registerWebsocket = (app, getWss) => {

  const server = getWss();

  app.ws('/', (ws, _req) => {
    console.log('Client connected');
    console.log(server.clients.size + ' connected');

    ws.on('open', req => {
      console.log('Connect', req);
    });

    ws.on('close', _ => {
      console.log('Client disconnect');
      console.log(server.clients.size + ' connected');
    });

    ws.on('message', msg => {
      server.clients.forEach((client) => {
        client.send(msg);
      });
    });

  });
};
