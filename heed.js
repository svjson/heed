#!/bin/node
import express from 'express';
import expressWs from 'express-ws';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadSlide } from './lib/slide.js';

const ws = expressWs(express());
const app = ws.app;
const router = express.Router();

const args = process.argv.slice(2);
const presentationRoot = process.env.PWD + '/';

const heedRoot = path.dirname(fileURLToPath(import.meta.url));

app.use(router);
app.use(express.static(heedRoot + '/static/'));
app.use('/presentation/', express.static(presentationRoot));
app.use('/speaker/', express.static(heedRoot + '/speaker-static/'));
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

app.get('/slide/*', async function(req, res, next) {
  const slide = await loadSlide(presentationRoot, req.params[0]);
  if (slide) {
    res.send(slide);
  } else {
    console.log('404 - ' + req.params[0]);
    res.status(404).send();
  }
})

app.ws('/navigation', function(ws, req) {
  let channel = ws.getWss('/navigation');

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
