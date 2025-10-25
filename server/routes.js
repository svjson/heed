import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

import express from 'express';

import { loadPresentation } from '../lib/presentation.js';
import { loadSlide } from '../lib/slide.js';

/*
 * Register the routes for the Heed server.
 *
 * @param {express.Application} app - The Express application instance.
 * @param {Object} options - Configuration options.
 * @param {string} options.presentationRoot - The root directory of the presentation.
 * @param {string} options.heedRoot - The root directory of the Heed package.
 */
export const registerRoutes = (
  app,
  presentationProvider,
  { presentationRoot, heedRoot },
) => {
  /**
   * Route to get the context of the presentation.
   */
  app.get('/context', (_req, res) => {
    res.send({
      directory: presentationRoot,
    });
  });

  /**
   * Serve the static files for the Heed presentation viewer
   */
  app.use(express.static(path.join(heedRoot, 'static', 'viewer')));

  /**
   * Serve the static files for the Speaker-application
   */
  app.use(
    '/speaker/',
    express.static(path.join(heedRoot, 'static', 'speaker')),
  );

  /**
   * Serve the static files for the presentation
   * FIXME: Should this perhaps be exclusively under /presentation ?
   */
  app.use(express.static(presentationRoot));

  /**
   * Route to get the presentation.json file.
   *
   * Additional logic applies, such as resolving the presentation index for
   * presentation using a folder layout-strategy rather than a static index,
   * which is why it is not simply served as a static file.
   */
  app.get('/presentation/presentation.json', async (_, res) => {
    res.send(presentationProvider.presentation);
  });

  /**
   * Route to get a specific slide.
   *
   * This will parse and compile slides written in .heed syntax, whereas
   * raw JSON slides will just be sent through without inspection.
   */
  app.get('/slide/*', async (req, res) => {
    const slide = await loadSlide(presentationRoot, req.params[0], {
      presentation: presentationProvider.presentation,
      includeNotes: Boolean(req.query?.notes),
      useErrorSlide: true,
    });
    if (slide) {
      res.send(slide);
    } else {
      console.log('404 - ' + req.params[0]);
      res.status(404).send();
    }
  });

  /**
   * Serve additional static files belonging to the presentation.
   */
  app.use('/presentation/', express.static(presentationRoot));

  /**
   * Serve plugin-specific files.
   */
  app.get('/plugins/:pluginId/:fileName', (req, res) => {
    var pluginDef = fs.readFileSync(
      `${presentationRoot}/plugins/${req.params.pluginId}/${req.params.fileName}`,
    );
    res.send(pluginDef);
  });

  /**
   * This is a legacy endpoint introduced in the before-times, specifically
   * to issue Paw64-specific commands. It is cray-cray and a PLANET-SIZE GAPING
   * SECURITY HOLE if anyone figured they'd serve up a presentation on a public
   * network. Yet I typed this up instead of removing it. What's the worst that
   * could happen? Heh.
   */
  app.get('/childprocess', (req, res) => {
    let cmd = req.query.cmd;
    childProcess.exec(cmd);
    res.sendStatus(200);
  });
};
