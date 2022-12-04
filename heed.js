#!/bin/node
const express = require('express'),
      childProcess = require('child_process'),
      fs = require('fs');

let expressWs = require('express-ws');
expressWs = expressWs(express());
const app = expressWs.app;

router = express.Router();

var args = process.argv.slice(2),
    presentationRoot = process.env.PWD + '/';

app.use(router);
app.use(express.static(__dirname + '/static/'));
app.use('/presentation/', express.static(presentationRoot));
app.use('/speaker/', express.static(__dirname + '/speaker-static/'));
app.get('/plugins/:pluginId/:fileName', function(req, res, next) {
  var pluginDef = fs.readFileSync(`${presentationRoot}/plugins/${req.params.pluginId}/${req.params.fileName}`);
  res.send(pluginDef);
});

app.get('/childprocess', function(req, res, next) {
  let cmd = req.query.cmd;
  childProcess.exec(cmd);
  res.sendStatus(200);
});

app.use(express.static(presentationRoot));

app.get('/context', function(req, res, next) {
  res.send({
    directory: process.cwd()
  });
});

app.ws('/navigation', function(ws, req) {
  let channel = expressWs.getWss('/navigation');

  ws.on('open', req => {
    console.log('Connect', req)
  });

  ws.on('close', req => {
    console.log('Client disconnect');
    console.log(channel.clients.size + ' connected');
  });

  ws.on('message', (msg) => {
    channel.clients.forEach((client) => {
      client.send(msg);
    })
  });
  console.log(channel.clients.size + ' connected');
});

app.listen(4000, function() {
  console.log('Listening on port 4000');
  console.log('Serving presentation from: ', presentationRoot);
});
