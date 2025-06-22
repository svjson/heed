/**
 * Register up the websocket server and endpoints used
 * to keep the Speaker-application in sync with the presentation.
 *
 * Not touched since the before-times.
 */
export const registerWebsocket = (app) => {

  app.ws('/navigation', function(ws, _req) {
    let channel = ws.getWss('/navigation');

    ws.on('open', req => {
      console.log('Connect', req);
    });

    ws.on('close', _ => {
      console.log('Client disconnect');
      console.log(channel.clients.size + ' connected');
    });

    ws.on('message', (msg) => {
      channel.clients.forEach((client) => {
        client.send(msg);
      });
    });

    console.log(channel.clients.size + ' connected');
  });

};
